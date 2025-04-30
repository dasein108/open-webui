export interface TxCyberlinkResponseResult {
	gid?: string; // Created/updated cyberlink ID
	fid?: string; // Created/updated formatted ID
	gids?: string[]; // Batch operation IDs
	fids?: string[]; // Batch operation formatted IDs
}

export interface TxStatusResponse {
	status: 'pending' | 'confirmed' | 'failed'; // Transaction status
	result?: TxCyberlinkResponseResult; // Optional result data
	error?: string; // Optional error message
}
