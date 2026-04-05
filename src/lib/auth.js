import { cookies } from 'next/headers';

/**
 * 從 Cookie 中取得目前登入使用者
 * @returns {object|null} user 物件或 null
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user');
  if (!userCookie?.value) return null;
  try {
    return JSON.parse(userCookie.value);
  } catch {
    return null;
  }
}

/**
 * 驗證使用者是否為教材管理者以上 (doc_admin 或 system_admin)
 * @returns {object|null} user 物件或 null
 */
export async function requireDocAdmin() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== 'system_admin' && user.role !== 'doc_admin') return null;
  return user;
}

/**
 * 驗證使用者是否為系統管理者 (system_admin)
 * @returns {object|null} user 物件或 null
 */
export async function requireSysAdmin() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== 'system_admin') return null;
  return user;
}
