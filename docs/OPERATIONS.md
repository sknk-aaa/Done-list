# 運用 / 環境 / ビルド

## 技術スタック（SPEC §2・固定）

Expo SDK 54 / expo-router / TypeScript / expo-sqlite + Drizzle ORM / Zustand / i18next（en プライマリ・ja）/
react-native-gesture-handler・reanimated / @gorhom/bottom-sheet（未使用：自作 BottomSheet を採用）/ react-native-svg /
@react-native-community/datetimepicker / async-storage / expo-notifications / expo-store-review / **react-native-purchases（RevenueCat）**。

## 環境固定（確定）

- **アプリ名**：`toDone`（`app.json` name ＝端末表示名、i18n `app.name` ＝アプリ内ロゴ）。slug=`done-list`、scheme=`donelist`。
- **bundle id**：`com.sknk.todone`（iOS/Android）。Apple Team ID `3H2LBDNPMU`。
- **App Store カテゴリ**：仕事効率化（主）／ライフスタイル（副）。
- **課金（RevenueCat）**：entitlement `pro`、製品 `com.sknk.todone.pro`（非消費型）、iOS Public SDK Key `appl_cIpfWvjeZpoVAJWZcmncKcUyNqF`（`EXPO_PUBLIC_RC_IOS_KEY` で上書き可）。Pro＝広告非表示＋ダークテーマ。dev は `FORCE_PRO` で解放。
- **公開ページ**：`https://sknk-aaa.github.io/Done-list/`（`/faq.html`・`/privacy.html`、英日トグル）。GitHub Pages は **GitHub Actions 方式**（`build_type=workflow`、`website/` 配信、`pages.yml`）。**ASCのプライバシーURL＝`…/privacy.html`**、App privacy は「データ収集なし」。
- **お問い合わせフォーム（Tally）**：en `https://tally.so/r/81rG5Y` / ja `https://tally.so/r/obzogX`。
- アクセント色初期値：`#48C1A8`。アイコン：`./icon.png`（原本・sRGBチャンク有り。ImageMagick加工はsRGB chunkを失いgAMA washoutでくすむので不可）。splash/Android背景 teal `#05AEA9`。

## dev 手順

```bash
npm run start       # Expo Go で開く（実機・実 DB）
npm run web         # Web プレビュー（in-memory モックデータ）
npm run typecheck
npm run db:generate # スキーマ変更後
```

- `src/lib/dev.ts`：`SEED`（dev のみ true＝2026-06 デザインデータ投入＋today=2026-06-19固定）、`FORCE_PRO`（dev のみ true＝Pro解放）。いずれも `__DEV__ && true` なので **Release では自動オフ**（手動変更不要）。

### Web 自己検証ハーネス（任意）

expo-sqlite(web) は SharedArrayBuffer/COOP-COEP が必要なため、web では in-memory モック（`src/**/**.web.ts`）に差し替えている。
Playwright で確認する場合は COOP/COEP を足す簡易プロキシ（`/tmp/coep-proxy.js` 相当：8082→8081 へ転送しヘッダ付与）を噛ませる。
**WSL2 では Metro のファイル監視が効かないことがある**ため、変更反映には Metro 再起動が必要。

## ビルド / 配信

GitHub Actions。手順は `~/.claude/docs/IOS_CICD_RECIPE.md` を参照。ネイティブ機能（通知等）の確認には `npx expo prebuild` で ios/android を生成（`.gitignore` 済み）。
