import { createOrLoadUserKey } from './keyring';

export async function getCurrentUserDataKey(): Promise<CryptoKey | null> {
	try {
		// Lazy import to avoid circular deps
		const { supabase } = await import('../config/supabaseClient');
		const { data, error } = await supabase.auth.getSession();
		if (error || !data.session?.user?.id) return null;
		const userId = data.session.user.id;
		// Derive using short-lived access token; not perfect E2E but enables decryption across session
		const secret = data.session.access_token || userId;
		return await createOrLoadUserKey(userId, secret);
	} catch {
		return null;
	}
}


