// Minimal client-side crypto utilities using WebCrypto
// Provides AES-GCM symmetric encryption and PBKDF2-based key derivation.

export type DerivedKeyMaterial = {
	key: CryptoKey;
	salt: Uint8Array; // random salt used for derivation
};

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

export async function deriveKeyFromSecret(secret: string, salt?: Uint8Array): Promise<DerivedKeyMaterial> {
	const saltToUse = salt ?? crypto.getRandomValues(new Uint8Array(16));
	const baseKey = await crypto.subtle.importKey(
		'raw',
		TEXT_ENCODER.encode(secret),
		{ name: 'PBKDF2' },
		false,
		['deriveKey']
	);
	const key = await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: saltToUse as any,
			iterations: 150000,
			hash: 'SHA-256',
		},
		baseKey,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
	return { key, salt: saltToUse };
}

export async function encryptBytes(key: CryptoKey, plaintext: Uint8Array): Promise<{ iv: Uint8Array; ciphertext: Uint8Array }> {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const ciphertextBuffer = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv: iv as any },
		key,
		plaintext as any
	);
	return { iv, ciphertext: new Uint8Array(ciphertextBuffer) };
}

export async function decryptBytes(key: CryptoKey, iv: Uint8Array, ciphertext: Uint8Array): Promise<Uint8Array> {
	const plaintext = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: iv as any },
		key,
		ciphertext as any
	);
	return new Uint8Array(plaintext);
}

export async function encryptString(key: CryptoKey, text: string): Promise<{ iv: Uint8Array; ciphertextB64: string }>{
	const bytes = TEXT_ENCODER.encode(text);
	const { iv, ciphertext } = await encryptBytes(key, bytes);
	return { iv, ciphertextB64: toBase64(ciphertext) };
}

export async function decryptToString(key: CryptoKey, iv: Uint8Array, ciphertextB64: string): Promise<string> {
	const ciphertext = fromBase64(ciphertextB64);
	const plain = await decryptBytes(key, iv, ciphertext);
	return TEXT_DECODER.decode(plain);
}

export function toBase64(data: Uint8Array): string {
	let binary = '';
	for (let i = 0; i < data.byteLength; i++) binary += String.fromCharCode(data[i]);
	return btoa(binary);
}

export function fromBase64(b64: string): Uint8Array {
	const binary = atob(b64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
	const total = arrays.reduce((sum, a) => sum + a.length, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const a of arrays) {
		out.set(a, offset);
		offset += a.length;
	}
	return out;
}


