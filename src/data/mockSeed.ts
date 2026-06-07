/**
 * Design-mock seed data (June 2026), ported verbatim from to done/To Done.html.
 * Used only by the dev seeder (src/lib/dev.ts SEED) to reproduce the approved
 * screenshots for visual diffing. Not used in production.
 */

export type SeedTask = {
  title: string;
  tag: string; // default-tag name
  done: boolean;
  time?: string;
  memo?: string;
};

/** Daily seed for June 19, 2026 (tab1 ground truth). */
export const DAILY_SEED: SeedTask[] = [
  { title: 'ブログ更新', tag: '仕事', done: true, time: '08:00', memo: '新作レビューの記事を公開した。' },
  { title: 'ジムで筋トレ', tag: '健康', done: true, time: '07:00' },
  { title: '買い出し（スーパー）', tag: '買い物', done: false, time: '18:30', memo: '牛乳・卵・パン・野菜' },
  { title: '資料作成（提案書）', tag: '仕事', done: true, time: '14:00', memo: '第2版。価格表を更新する。' },
  { title: '読書（20分）', tag: '自己投資', done: false, time: '22:00' },
  { title: '夕食の準備', tag: '家事', done: true, time: '19:00' },
  { title: '英語学習アプリ', tag: '学習', done: false, time: '07:30', memo: 'Unit 12 まで。15分継続。' },
];

/** Recurring month-task name → default-tag name. */
export const TAGOF: Record<string, string> = {
  ブログ更新: '仕事',
  ジム: '健康',
  買い出し: '買い物',
  家計簿: '家事',
  資料作成: '仕事',
  英語: '学習',
  読書: '自己投資',
  掃除: '家事',
  散歩: '健康',
  通院: '健康',
};

/** Month grid cells (7×6). `n`=day number, `out`=adjacent month, `k`=task names. */
export type MonthCell = { n: number; out?: boolean; k?: string[] };

const blog = 'ブログ更新';
const gym = 'ジム';
const kai = '買い出し';
const kak = '家計簿';
const sir = '資料作成';
const eng = '英語';
const dok = '読書';
const souji = '掃除';
const sanpo = '散歩';
const tsuin = '通院';

export const MONTH_CELLS: MonthCell[] = [
  { n: 31, out: true, k: [blog, gym, kai, kak] }, { n: 1, k: [blog, gym, kai] }, { n: 2, k: [sir, eng, dok] }, { n: 3, k: [gym, blog, souji] }, { n: 4, k: [kak, kai, sir] }, { n: 5, k: [souji, tsuin, dok, eng] }, { n: 6, k: [sanpo, blog, kai] },
  { n: 7, k: [dok, gym, kak] }, { n: 8, k: [blog, sir, kai] }, { n: 9, k: [eng, souji, sanpo] }, { n: 10, k: [gym, blog, dok] }, { n: 11, k: [sir, kak, kai, souji] }, { n: 12, k: [tsuin, eng, sanpo] }, { n: 13, k: [blog, kai] },
  { n: 14, k: [gym, dok, kak] }, { n: 15, k: [blog, sir, eng] }, { n: 16, k: [sanpo, souji, kai] }, { n: 17, k: [gym, blog, dok] }, { n: 18, k: [sir, kak, kai] }, { n: 19, k: [blog, gym, kak, eng] }, { n: 20, k: [souji, tsuin, kai] },
  { n: 21, k: [dok, sanpo, kai] }, { n: 22, k: [blog, sir, kak, eng] }, { n: 23, k: [gym, souji, dok, kai] }, { n: 24, k: [blog, sanpo, kai] }, { n: 25, k: [sir, kak, eng] }, { n: 26, k: [tsuin, souji, dok, sanpo] }, { n: 27, k: [blog, kai] },
  { n: 28, k: [gym, dok, kak, kai] }, { n: 29, k: [blog, sir, eng, sanpo] }, { n: 30, k: [sanpo, souji, kai, dok] }, { n: 1, out: true, k: [blog, gym, kak] }, { n: 2, out: true, k: [sir, eng, kai] }, { n: 3, out: true, k: [souji, tsuin, dok] }, { n: 4, out: true, k: [sanpo, blog] },
];

/** Derived done state for generated month days (keeps Daily and Month in sync). */
export const derivedDone = (day: number, index: number) => (day + index) % 3 === 0;

/** Default tag set (name → preset color), shown in the mock and seeded on first run. */
export const DEFAULT_TAGS: { name: string; color: string }[] = [
  { name: '仕事', color: '#5E80A6' },
  { name: '健康', color: '#6FA08C' },
  { name: '買い物', color: '#C68A5E' },
  { name: '家事', color: '#C481A0' },
  { name: '自己投資', color: '#8E7CA6' },
  { name: '学習', color: '#C2A85E' },
];
