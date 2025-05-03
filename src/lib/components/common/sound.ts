import { settings } from '$lib/stores';
import { get, writable } from 'svelte/store';

const playingNotificationSound = writable(false);

export enum AudioFiles {
	Notification = '/audio/notification.mp3',
	Greeting = '/audio/greeting.mp3',
	Error = '/audio/error.mp3'
}

export function playSystemSoundIfAllowed(audioFile = AudioFiles.Notification) {
	const $settings = get(settings);
	const $playingNotificationSound = get(playingNotificationSound);
	if ($settings.notificationSoundAlways) {
		if (!$playingNotificationSound) {
			playingNotificationSound.set(true);
			const audio = new Audio(audioFile);
			audio.play().finally(() => {
				playingNotificationSound.set(false);
			});
		}
	}
}
