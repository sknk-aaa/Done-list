# Done-list（toDone）— AI向け

> 同dirの `CLAUDE.md` も併設（同内容）。共通ルール（コミュニケーション/Git/コード規約/gp/ツール等）は `/home/aaa/project/AGENTS.md`。ここには **このアプリ固有のルールと要点だけ** を置く。

「やること / やったこと」を記録するログ型タスク/習慣アプリ（Expo + React Native + TypeScript）。主役は振り返り（月ビュー）。
仕様の正は [SPEC.md](SPEC.md)、ビジュアル/挙動の正は `to done/`（`To Done.html` が visual source of truth、`handoff/` に token・画面仕様・スクショ）。

## 事業/マーケ方針

- このアプリは公開後も、ストア訴求、スクリーンショット、ASO、レビュー獲得、広告/Pro導線、SNS/動画施策を継続改善して売上を作る前提で扱う。
- コア訴求は「やることを管理する」だけでなく、「やったことが残るから振り返れる」。ToDoの義務感より、記録・達成感・月ビューで積み上げが見える価値を前面に出す。
- デザインの静けさと使いやすさが売り。多機能化より、毎日開いても疲れない、サッと記録できる、後から見返して気持ちいい体験を優先する。
- マーケ施策、ストア画像方針、SNS/動画台本、価格/広告/Pro AB案は `docs/MARKETING.md` に蓄積する。

## このアプリ固有の厳守事項

- **デザイン優先**：`to done/`（`To Done.html` ＋ `handoff/`）と SPEC.md が食い違う場合は **デザインを優先**。
  ただしデータモデル・通知・レビュー・課金内容など「デザインに現れない仕様」は SPEC.md に従う。確定済みの相違一覧は [docs/DESIGN.md](docs/DESIGN.md)。
- **アクセント色は `#48C1A8`**（SPEC の `#14B8A6` ではなくデザインの teal）。トークンは [src/theme/theme.tsx](src/theme/theme.tsx)（`handoff/theme.ts` 由来）。
- データ取得は `@/data/useData`（`useDailyItems`/`useMonthItems`/`useTags`）経由。画面から直接 `useLiveQuery` を呼ばない。
- DB の CRUD は `@/lib/taskActions` 経由（通知リコンサイル/レビュー判定を集約）。DBスキーマ変更時は Drizzle スキーマ更新後に `npm run db:generate`。
- **`src/lib/dev.ts` の `SEED`/`FORCE_PRO`** は `__DEV__ && true` ＝ dev のみ有効（SEED=デザインデータ投入＋today固定、FORCE_PRO=Pro解放）。**Release では自動オフ**なので手動変更不要。
- 検証は `npm run typecheck`（tsc）。Web/実機での目視確認はユーザーが行う（こちらで検証ループを回さない）。

## Expo SDK は 54 固定（理由つき）

- **Expo SDK 54**（React Native 0.81.5 / React 19.1.0）。`create-expo-app@latest` は 56 を入れるが、**App Store の Expo Go は 54 までしか対応せず**、56 だと実機で "Project is incompatible with this version of Expo Go" になる（2026-06 確認）。Expo Go で動かす限り 54 を維持。
- ダウングレード手順: `npx expo install expo@^54.0.0` → `npx expo install --fix`。
- `@react-native-community/datetimepicker` のピア衝突回避のため `.npmrc` に `legacy-peer-deps=true`。`npm install` 系はこれ前提。

## リリース構成（v1.0 提出済み・要点）

正は [docs/OPERATIONS.md](docs/OPERATIONS.md) / [docs/HANDOFF.md](docs/HANDOFF.md)。

- アプリ名 `toDone`、bundle id `com.sknk.todone`、Apple Team `3H2LBDNPMU`。カテゴリ＝仕事効率化(主)/ライフスタイル(副)。
- **課金は RevenueCat**（`react-native-purchases`）: entitlement `pro`、製品 `com.sknk.todone.pro`（非消費型）。**Pro＝広告非表示＋ダークテーマ**。広告は初版なし（AdMob は後日・Dev Build 要で Expo Go 不可）。
- 公開ページは GitHub Pages（Actions 方式）`https://sknk-aaa.github.io/Done-list/{faq,privacy}.html`、App privacy「データ収集なし」。問い合わせは Tally（en `81rG5Y` / ja `obzogX`）。
- アイコンは原本 `icon.png`（sRGB チャンク有り）をそのまま使う。alpha/サイズは Expo が生成（ユーザー提供素材は無断加工しない＝グローバル既出）。

## 開発メモ

- Web プレビュー（自己検証用）: native は実 expo-sqlite、**web は in-memory モック**（`*.web.ts` を Metro が解決）。
- **WSL2 では Metro のファイル監視が効かない**ことがある。Web で確認するときは Metro を再起動する。
- 並び替え（reorderable）はカルーセルとネイティブ競合でフリーズ→撤去。時刻順の自動配置（`sortDayByTime`）で代替。

## Theme Studio（テーマライブ調整）

色を実機同等の見た目でライブ調整するときは汎用 Theme Studio を使う。手順書 `/home/aaa/project/docs/THEME_STUDIO.md`、テンプレ `/home/aaa/project/docs/theme-studio/`。
**このアプリには導入済み**（参照実装）: `tools/theme-editor/`。起動は `expo start --web` ＋ `node tools/theme-editor/server.mjs` → http://localhost:7777。

## ドキュメント索引

- [SPEC.md](SPEC.md) … 仕様の正（データモデル・画面・計算式）
- [docs/DESIGN.md](docs/DESIGN.md) … デザイン解釈と SPEC との相違の確定
- [docs/OPERATIONS.md](docs/OPERATIONS.md) … 識別子・環境固定・課金/公開ID・ビルド/配信・dev 手順
- [docs/HANDOFF.md](docs/HANDOFF.md) … 現状・残タスク・既知の問題
- [docs/MARKETING.md](docs/MARKETING.md) … ストア訴求・ASO・SNS/動画台本・価格/広告AB案
