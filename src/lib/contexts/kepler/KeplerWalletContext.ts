import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { SigningCosmWasmClient, CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import type { ExecuteResult } from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/stargate';
import type { TxStatusResponse } from './types';
import { parseTxStatus } from './utils';

// Chain Configuration
// Local
// const CHAIN_CONFIG = {
// 	CONTRACT_ADDRESS: 'wasm1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsfg5rpz',
// 	CHAIN_ID: 'test-chain',
// 	DENOM: 'stake',
// 	NODE_URL: 'http://localhost:26657',
// 	RPC_TIMEOUT: 60000,
// 	GAS_PRICE_AMOUNT: '0.025'
// } as const;

const CHAIN_CONFIG = {
	CONTRACT_ADDRESS: 'cyber14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sjxkrqd',
	CHAIN_ID: 'cyber42-1',
	DENOM: 'STAKE',
	NODE_RPC_URL: 'https://rpc.cyber-rollup.chatcyber.ai',
	LCD_URL: 'https://api.cyber-rollup.chatcyber.ai',
	RPC_TIMEOUT: 60000,
	GAS_PRICE_AMOUNT: '0.15'
} as const;

// Chain suggestion configuration for Keplr
const CHAIN_INFO = {
	chainId: CHAIN_CONFIG.CHAIN_ID,
	chainName: 'Cyber TESTNET',
	rpc: CHAIN_CONFIG.NODE_RPC_URL,
	rest: CHAIN_CONFIG.LCD_URL,
	bip44: {
		coinType: 118
	},
	bech32Config: {
		bech32PrefixAccAddr: 'cyber',
		bech32PrefixAccPub: 'cyberpub',
		bech32PrefixValAddr: 'cybervaloper',
		bech32PrefixValPub: 'cybervaloperpub',
		bech32PrefixConsAddr: 'cybervalcons',
		bech32PrefixConsPub: 'cybervalconspub'
	},
	currencies: [
		{
			coinDenom: CHAIN_CONFIG.DENOM,
			coinMinimalDenom: CHAIN_CONFIG.DENOM.toLowerCase(),
			coinDecimals: 6
		}
	],
	feeCurrencies: [
		{
			coinDenom: CHAIN_CONFIG.DENOM,
			coinMinimalDenom: CHAIN_CONFIG.DENOM.toLowerCase(),
			coinDecimals: 6,
			gasPriceStep: {
				low: 0.1,
				average: 0.15,
				high: 0.3
			}
		}
	],
	stakeCurrency: {
		coinDenom: CHAIN_CONFIG.DENOM,
		coinMinimalDenom: CHAIN_CONFIG.DENOM.toLowerCase(),
		coinDecimals: 6
	}
};

interface SignDoc {
	chain_id: string;
	account_number: string;
	sequence: string;
	fee: {
		amount: { amount: string; denom: string }[];
		gas: string;
	};
	msgs: unknown[];
	memo: string;
}

interface KeplerWalletState {
	isConnected: boolean;
	address: string | null;
}

interface KeplerWalletContext {
	connect: () => Promise<void>;
	disconnect: () => Promise<void>;
	signTransaction: (signDoc: SignDoc) => Promise<ExecuteResult>;
	executeContract: (contractMsg: Record<string, unknown>) => Promise<ExecuteResult>;
	getTx: (transactionHash: string) => Promise<TxStatusResponse | null>;
	state: Writable<KeplerWalletState>;
	config: typeof CHAIN_CONFIG;
	client: CosmWasmClient | null;
}

const STORAGE_KEY = 'kepler_wallet_state';

function createKeplerWalletContext(): KeplerWalletContext {
	// Initialize state from localStorage if available
	const initialState: KeplerWalletState = browser
		? JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"isConnected": false, "address": null}')
		: { isConnected: false, address: null };

	const state = writable<KeplerWalletState>(initialState);
	let cosmWasmClient: CosmWasmClient | null = null;

	// Subscribe to state changes and save to localStorage
	if (browser) {
		state.subscribe((value) => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		});

		// Initialize CosmWasmClient immediately
		CosmWasmClient.connect(CHAIN_CONFIG.NODE_RPC_URL)
			.then((client) => {
				cosmWasmClient = client;
			})
			.catch(console.error);
	}

	const connect = async () => {
		try {
			if (!window.keplr) {
				throw new Error('Keplr extension not installed');
			}

			try {
				// Try to suggest the chain to Keplr
				await window.keplr.experimentalSuggestChain(CHAIN_INFO);
			} catch (error) {
				console.warn('Failed to suggest chain to Keplr:', error);
				// Continue anyway as the chain might already be added
			}

			// Enable access to chain
			await window.keplr.enable(CHAIN_CONFIG.CHAIN_ID);

			// Get the offline signer
			const offlineSigner = window.keplr.getOfflineSigner(CHAIN_CONFIG.CHAIN_ID);

			// Get user's Kepler account
			const accounts = await offlineSigner.getAccounts();
			const address = accounts[0].address;

			state.update((s) => ({ ...s, isConnected: true, address }));
		} catch (error) {
			console.error('Failed to connect Kepler wallet:', error);
			throw error;
		}
	};

	const disconnect = async () => {
		state.update((s) => ({ ...s, isConnected: false, address: null }));
	};

	const signTransaction = async (signDoc: SignDoc) => {
		try {
			if (!window.keplr) {
				throw new Error('Keplr extension not installed');
			}

			const offlineSigner = window.keplr.getOfflineSigner(CHAIN_CONFIG.CHAIN_ID);
			const accounts = await offlineSigner.getAccounts();

			// Ensure the signDoc uses our chain configuration
			signDoc.chain_id = CHAIN_CONFIG.CHAIN_ID;
			if (signDoc.fee.amount.length > 0) {
				signDoc.fee.amount[0].denom = CHAIN_CONFIG.DENOM;
			}

			return await offlineSigner.signAmino(accounts[0].address, signDoc);
		} catch (error) {
			console.error('Failed to sign transaction:', error);
			throw error;
		}
	};

	const getTx = async (transactionHash: string): Promise<TxStatusResponse | null> => {
		if (!cosmWasmClient) {
			throw new Error('CosmWasm client not initialized');
		}
		const tx = await cosmWasmClient.getTx(transactionHash);

		if (!tx) {
			return null;
		}

		return parseTxStatus(tx || {});
	};

	const waitForTransaction = async (
		txHash: string,
		timeoutMs: number = 30000,
		pollIntervalMs: number = 1000
	) => {
		const startTime = Date.now();

		while (Date.now() - startTime < timeoutMs) {
			try {
				const result = await getTx(txHash);

				return result;
			} catch (error) {
				console.error(`Error while polling transaction ${txHash}:`, error);
				// Continue polling if transaction not found
			}
			await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
		}

		throw new Error(`Transaction confirmation timed out after ${timeoutMs}ms`);
	};

	const executeContract = async (contractMsg: Record<string, unknown>) => {
		try {
			if (!window.keplr) {
				throw new Error('Keplr extension not installed');
			}

			// Get the offline signer
			const offlineSigner = window.keplr.getOfflineSigner(CHAIN_CONFIG.CHAIN_ID);
			const accounts = await offlineSigner.getAccounts();
			const sender = accounts[0];

			// Create signing client
			const gasPrice = GasPrice.fromString(`${CHAIN_CONFIG.GAS_PRICE_AMOUNT}${CHAIN_CONFIG.DENOM}`);
			const signingClient = await SigningCosmWasmClient.connectWithSigner(
				CHAIN_CONFIG.NODE_RPC_URL,
				offlineSigner,
				{ gasPrice }
			);

			// Execute contract
			const result = await signingClient.execute(
				sender.address,
				CHAIN_CONFIG.CONTRACT_ADDRESS,
				contractMsg,
				'auto'
			);

			return result;
		} catch (error) {
			console.error('Failed to execute contract:', error);
			throw error;
		}
	};

	return {
		connect,
		disconnect,
		signTransaction,
		executeContract,
		getTx: waitForTransaction,
		state: {
			...state,
			subscribe: state.subscribe
		},
		config: CHAIN_CONFIG,
		get client() {
			return cosmWasmClient;
		}
	};
}

export const keplerWallet = createKeplerWalletContext();
