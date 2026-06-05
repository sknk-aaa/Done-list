import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations as useDrizzleMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync } from 'expo-sqlite';

import migrations from '../../drizzle/migrations';
import * as schema from './schema';

export const expoDb = openDatabaseSync('donelist.db', { enableChangeListener: true });

export const db = drizzle(expoDb, { schema });

export function useMigrations() {
  return useDrizzleMigrations(db, migrations);
}
