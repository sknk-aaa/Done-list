# やったこと管理（Done-list）

「やること / やったこと」を記録するログ型タスクアプリ。ToDo としても使えるが、主役は「後から振り返れること」（月ビュー）。
Expo + React Native + TypeScript、ローカル SQLite（Drizzle）。英語プライマリ / 日本語ローカライズ。

## 開発

```bash
npm install
npm run start      # Expo dev server（Expo Go で開く）
npm run ios        # iOS（要 macOS）
npm run web        # Web プレビュー
npm run typecheck  # tsc --noEmit
npm run db:generate # スキーマ変更後にマイグレーション生成
```

## ドキュメント

- [SPEC.md](SPEC.md) — 仕様の正（データモデル・画面・計算式）
- [docs/DESIGN.md](docs/DESIGN.md) — デザイン解釈・SPEC との相違の確定
- [docs/OPERATIONS.md](docs/OPERATIONS.md) — 環境・ビルド・dev 手順
- [docs/HANDOFF.md](docs/HANDOFF.md) — 現状・残タスク・既知の問題
- `to done/` — 承認済みデザイン（`To Done.html` が visual source of truth、`handoff/` に token/仕様/スクショ）

> 開発で AI を使う場合は [CLAUDE.md](CLAUDE.md) を参照。
