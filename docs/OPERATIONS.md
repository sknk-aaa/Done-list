# 運用 / 環境 / ビルド

## 技術スタック（SPEC §2・固定）

Expo SDK 54 / expo-router / TypeScript / expo-sqlite + Drizzle ORM / Zustand / i18next（en プライマリ・ja）/
react-native-gesture-handler・reanimated / @gorhom/bottom-sheet（未使用：自作 BottomSheet を採用）/ react-native-svg /
@react-native-community/datetimepicker / async-storage / expo-notifications / expo-store-review。

## 環境固定（未確定＝要決定）

- **アプリ名**：未定（仮 `やったこと管理` / en `Done Log`）。`app.json` の `name`、i18n `app.name` を確定時に更新。
- **bundle id / slug**：`app.json` slug=`done-list`、scheme=`donelist`。bundle id は配信時に決定。
- アクセント色初期値：`#48C1A8`（`settings.accentColor` 既定）。
- アイコン：`./icon.png`（ルート、ユーザー提供）。splash 背景は白。

## dev 手順

```bash
npm run start       # Expo Go で開く（実機・実 DB）
npm run web         # Web プレビュー（in-memory モックデータ）
npm run typecheck
npm run db:generate # スキーマ変更後
```

- `src/lib/dev.ts` の `SEED`：dev のみ true。2026-06 のデザインデータを投入し today を 2026-06-19 に固定（スクショ照合用）。**リリース前に false**。

### Web 自己検証ハーネス（任意）

expo-sqlite(web) は SharedArrayBuffer/COOP-COEP が必要なため、web では in-memory モック（`src/**/**.web.ts`）に差し替えている。
Playwright で確認する場合は COOP/COEP を足す簡易プロキシ（`/tmp/coep-proxy.js` 相当：8082→8081 へ転送しヘッダ付与）を噛ませる。
**WSL2 では Metro のファイル監視が効かないことがある**ため、変更反映には Metro 再起動が必要。

## ビルド / 配信

GitHub Actions。手順は `~/.claude/docs/IOS_CICD_RECIPE.md` を参照。ネイティブ機能（通知等）の確認には `npx expo prebuild` で ios/android を生成（`.gitignore` 済み）。
