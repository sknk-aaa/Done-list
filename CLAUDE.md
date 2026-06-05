@AGENTS.md

# やったこと管理（Done-list）

「やること / やったこと」を記録するログ型タスクアプリ（Expo + React Native + TypeScript）。
主役は振り返り（月ビュー）。詳細仕様は [SPEC.md](SPEC.md)、デザインは `to done/`（HTML モックが visual source of truth）。

## このアプリ固有の厳守事項

- **デザイン優先**：`to done/`（`To Done.html` ＋ `handoff/`）と SPEC.md が食い違う場合はデザインを優先する。
  ただしデータモデル・通知・レビュー・課金内容など「デザインに現れない仕様」は SPEC.md に従う。
- **アクセント色は `#48C1A8`**（SPEC の `#14B8A6` ではなくデザインの teal）。トークンは [src/theme/tokens.ts](src/theme/tokens.ts)。
- **`any` 禁止**。型安全最優先。エラーハンドリングはシステム境界のみ。
- データ取得は `@/data/useData`（`useDailyItems`/`useMonthItems`/`useTags`）経由。画面から直接 `useLiveQuery` を呼ばない。
- DB 変更（CRUD）は `@/lib/taskActions` 経由（通知リコンサイル/レビュー判定を集約）。
- **`src/lib/dev.ts` の `SEED`**：dev のみ true でモック（2026-06 のデザインデータ＋today固定）を投入。リリース前に false（実日付・空起動）。

## 確定済みのデザイン↔SPEC 相違（実装はデザイン側を採用）

- 月チップ色 = 各タスクの**タグ色**（SPEC §4）。モックの名前別色は作り込みデータの矛盾のため非採用。
- 絞り込みのタグは**既定で未選択**（空＝全件表示、選んだタグのみ表示）。
- デイリーヘッダーに「‹ ›」矢印は無し（スワイプ＋日付タップ＋「↩今日へ」で移動）。
- 月セルのタップは**その日付でデイリーへ遷移**（詳細ボトムシートは作らない）。
- Pro は **広告非表示のみ**（モックの「タグ無制限・テーマ変更」は無視）。

## 開発メモ

- Web プレビュー（自己検証用）: native は実 expo-sqlite、**web は in-memory モック**（`*.web.ts` を Metro が解決）。
- **WSL2 では Metro のファイル監視が効かない**ことがある。変更を Web で確認するときは Metro を再起動する。
- ビルド/配信は GitHub Actions（`~/.claude/docs/IOS_CICD_RECIPE.md`）。

## ドキュメント索引

- [SPEC.md](SPEC.md) … 仕様の正（データモデル・画面・計算式）
- [docs/DESIGN.md](docs/DESIGN.md) … デザイン解釈と SPEC との相違の確定
- [docs/OPERATIONS.md](docs/OPERATIONS.md) … 環境・ビルド・dev 手順
- [docs/HANDOFF.md](docs/HANDOFF.md) … 現状・残タスク・既知の問題
