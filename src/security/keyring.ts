// Local keyring for deriving and storing per-user encryption keys.
// Uses WebCrypto for key derivation and stores wrapped key material in localStorage.

import { deriveKeyFromSecret, fromBase64, toBase64 } from './crypto';

export type UserKeyBundle = {
	// Wrapped symmetric key for data encryption
	wrappedKeyB64: string;
	// Salt used to derive the wrapping key from user secret
	wrappingSaltB64: string;
};

const STORAGE_PREFIX = 'qb_keyring_';

async function importAesKey(rawKeyBytes: Uint8Array): Promise<CryptoKey> {
	return crypto.subtle.importKey('raw', rawKeyBytes as any, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function createOrLoadUserKey(userId: string, userSecret: string): Promise<CryptoKey> {
	const storageKey = STORAGE_PREFIX + userId;
	const existing = localStorage.getItem(storageKey);

	const { key: wrappingKey, salt } = await deriveKeyFromSecret(userSecret);

	if (existing) {
		const bundle: UserKeyBundle = JSON.parse(existing);
		const wrappingSalt = fromBase64(bundle.wrappingSaltB64);
		// If stored salt differs, re-derive with stored salt
		const derived = await deriveKeyFromSecret(userSecret, wrappingSalt);
		const wrappedBytes = fromBase64(bundle.wrappedKeyB64);
		const iv = wrappedBytes.slice(0, 12);
		const ciphertext = wrappedBytes.slice(12);
		const raw = new Uint8Array(
			await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, derived.key, ciphertext)
		);
		return importAesKey(raw);
	}

	// Generate new data key and wrap it with wrappingKey
	const rawDataKey = crypto.getRandomValues(new Uint8Array(32));
	const dataKey = await importAesKey(rawDataKey);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const wrapped = new Uint8Array(
		await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wrappingKey, rawDataKey)
	);
	const wrappedConcat = new Uint8Array(iv.length + wrapped.length);
	wrappedConcat.set(iv, 0);
	wrappedConcat.set(wrapped, iv.length);

	const bundle: UserKeyBundle = {
		wrappedKeyB64: toBase64(wrappedConcat),
		wrappingSaltB64: toBase64(salt),
	};
	localStorage.setItem(storageKey, JSON.stringify(bundle));
	return dataKey;
}

export function clearUserKey(userId: string): void {
	localStorage.removeItem(STORAGE_PREFIX + userId);
}


