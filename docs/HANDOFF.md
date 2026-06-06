# 現状・残タスク・既知の問題

## 現状（実装済み）

- データ層：Drizzle スキーマ＋マイグレーション、初回 settings/プリセットタグ投入、dev シード（`SEED`）。
- 画面：タブ1 デイリー（日付ナビ・達成サマリー・タスク行・チェックリング・FAB・空状態・フィルタバー）、タブ2 月ビュー（曜日帯・7列グリッド・今日/選択強調・タグ色チップ・+N・日タップでデイリー遷移）。
- オーバーレイ：新規/編集ボトムシート、絞り込みシート、タグ編集（右スライド）、ドロワー/設定、日付ポップオーバー（日/月）、オンボーディング（3スライド・言語トグル・初回起動判定）、トースト。
- ジェスチャー：**日次=指追従カルーセル（横ページングFlatList、前後の日が見える）／月次=指追従カルーセル（paging ScrollView、前後の月が見える）**。ドロワー設定 `swipeAction`（既定=日付・月の移動／画面切替も可）。月は日付左右の矢印でも移動可。**並び替え（reorderable）はネイティブでカルーセルと競合しフリーズしたため撤去**し、時刻順の自動配置で代替。
- 並び順：タスク追加時に**時刻あり=時刻昇順／時刻なし=末尾**へ自動配置（`sortDayByTime`）。デイリーは8件超で縦スクロール、非今日の末尾に「今日へ」ボタン。
- 通知（expo-notifications：全件リコンサイル）、アプリ内レビュー（expo-store-review：§10 条件）。オンボの「始める」でホーム遷移後に通知許可をリクエスト。
- **ダークテーマ（Pro機能・控えめネイビー）**：`src/theme/theme.tsx`（`ThemeProvider`/`useColors`）＋ `lightColors`/`darkColors`。全画面 `makeStyles(c)` で動的カラー化。`darkMode`(AsyncStorage) && `isPro` の時のみ適用。ドロワーにトグル。Onboardingのみライト固定。
- **課金（RevenueCat）**：`src/lib/purchases.ts`（Expo Goガード・`configure`・`getCustomerInfo`→`isPro`・`purchasePro`/`restorePro`）。entitlement `pro`、製品 `com.sknk.todone.pro`、iOS Public SDK Key は既定値（`EXPO_PUBLIC_RC_IOS_KEY`で上書き可）。Pro=広告非表示＋ダークテーマ。
- **アプリ内FAQ**：`FaqScreen`（右スライド・右スワイプ閉じ・Q/Aアコーディオン・テーマ対応）、`src/data/faq.ts`(en/ja)。ドロワー「よくある質問」から起動。
- アイコン/スプラッシュ：`icon.png`（原本・`sRGB`チャンク有り＝くすみ無し。**ImageMagick加工はsRGBチャンクを失いgAMA washoutになるので不可**）。alpha/サイズは Expo が生成。スプラッシュ/Android背景 teal `#05AEA9`。ドロワー用に `assets/images/icon-sm.png`(256px,strip)。
- 公開ページ：`website/`（FAQ・プライバシー、英日トグル）を **GitHub Actions で GitHub Pages 配信**（`build_type=workflow`）。URL: `https://sknk-aaa.github.io/Done-list/{faq,privacy}.html`。お問い合わせは Tally フォーム（en `81rG5Y`／ja `obzogX`、ドロワー・ページから）。
- i18n：en プライマリ / ja。
- アプリ名は **`toDone`**。App Store カテゴリ：**仕事効率化（主）／ライフスタイル（副）**。

## 残タスク

- [ ] **手動レビュー導線**（ドロワー「レビューして応援する」）を App Store の `?action=write-review` URL へ（App Store ID 確定後）。現在はトースト。
- [ ] **広告**：初版は広告なし（方針A）。AdMob は後日（Expo Go 不可・Dev Build 化が必要）。Pro=広告非表示は実装済み。
- [ ] **App Store 提出**（本セッションで実施中）：CI→TestFlight→ASCでIAP紐付け→審査提出。
- 解決済み：`SEED`/`FORCE_PRO` は `__DEV__ && true` で**Releaseは自動オフ**（手動変更不要）。

## 既知の事項 / 設計判断

- 月チップ色は各タスクのタグ色（SPEC §4）。モックの名前別色は非採用（[DESIGN.md](DESIGN.md) 参照）。
- 絞り込みのタグは既定で未選択（空＝全件表示、選んだタグのみ表示）。
- Web プレビューは in-memory モックデータ（実 DB は native のみ）。WSL2 では Metro 再起動が必要なことがある。
- `@gorhom/bottom-sheet` は依存に入っているが、デザイン精度と web 互換のため自作 `BottomSheet`（reanimated）を採用。整理時に依存削除可。

## 検証メモ

- `npm run typecheck` グリーン。Web で Daily/Month/Add/Filter/Drawer/DatePopover/TagEdit/Onboarding を目視確認しデザイン一致。
- 実機（Expo Go）での最終確認はユーザー側で実施予定。
