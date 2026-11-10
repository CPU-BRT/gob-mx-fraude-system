const COOKIE_NAME = 'pgmx_admin_session';

export async function createAdminSessionToken(
  username: string,
  password: string
): Promise<string> {
  const data = new TextEncoder().encode(`${username}:${password}:portal-gob-mx-v1`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function isValidAdminSession(
  cookieValue: string | undefined,
  username: string,
  password: string
): Promise<boolean> {
  if (!cookieValue) return false;
  const expected = await createAdminSessionToken(username, password);
  return cookieValue === expected;
}

export { COOKIE_NAME };
