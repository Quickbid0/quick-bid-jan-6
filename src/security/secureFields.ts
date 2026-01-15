import { encryptString, decryptToString, toBase64 } from './crypto';

const ENCODING_PREFIX = 'enc:v1:'; // enc:v1:<ivB64>:<ctB64>

export function isEncrypted(value: unknown): boolean {
	return typeof value === 'string' && value.startsWith(ENCODING_PREFIX);
}

export function encodeEncrypted(ivB64: string, ciphertextB64: string): string {
	return `${ENCODING_PREFIX}${ivB64}:${ciphertextB64}`;
}

export function decodeEncrypted(value: string): { ivB64: string; ciphertextB64: string } | null {
	if (!isEncrypted(value)) return null;
	const body = value.slice(ENCODING_PREFIX.length);
	const [ivB64, ciphertextB64] = body.split(':');
	if (!ivB64 || !ciphertextB64) return null;
	return { ivB64, ciphertextB64 };
}

export async function encryptField(key: CryptoKey, value: string): Promise<string> {
	const { iv, ciphertextB64 } = await encryptString(key, value);
	return encodeEncrypted(toBase64(iv), ciphertextB64);
}

export async function decryptField(key: CryptoKey, value: string): Promise<string> {
	const decoded = decodeEncrypted(value);
	if (!decoded) return value;
	const ivBytes = Uint8Array.from(atob(decoded.ivB64), c => c.charCodeAt(0));
	return decryptToString(key, ivBytes, decoded.ciphertextB64);
}

export async function encryptProfileFields(key: CryptoKey, profile: Record<string, any>, fields: string[]): Promise<Record<string, any>> {
	const out: Record<string, any> = { ...profile };
	for (const f of fields) {
		if (profile[f] != null) {
			out[f] = await encryptField(key, String(profile[f]));
		}
	}
	return out;
}


