// Web preview stub: the real expo-sqlite client is native-only.
// Web uses the in-memory data layer in queries.web.ts.
export const db = null as unknown as never;

export function useMigrations(): { success: boolean; error?: Error } {
  return { success: true };
}
