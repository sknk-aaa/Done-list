# 現状・残タスク・既知の問題

## 現状（実装済み）

- データ層：Drizzle スキーマ＋マイグレーション、初回 settings/プリセットタグ投入、dev シード（`SEED`）。
- 画面：タブ1 デイリー（日付ナビ・達成サマリー・タスク行・チェックリング・FAB・空状態・フィルタバー）、タブ2 月ビュー（曜日帯・7列グリッド・今日/選択強調・タグ色チップ・+N・日タップでデイリー遷移）。
- オーバーレイ：新規/編集ボトムシート、絞り込みシート、タグ編集（右スライド）、ドロワー/設定、日付ポップオーバー（日/月）、オンボーディング（3スライド・言語トグル・初回起動判定）、トースト。
- ジェスチャー：横スワイプ（日次=日付移動/画面切替・月次=月移動/画面切替、ドロワーで共通設定。**既定=画面切替**）。月ビューは日付左右の矢印でも月移動可。
- 通知（expo-notifications：全件リコンサイル）、アプリ内レビュー（expo-store-review：§10 条件）。オンボの「始める」でホーム遷移後に通知許可をリクエスト。
- アイコン/スプラッシュ：`icon.png`（1024・alpha除去済）をアイコン兼スプラッシュに使用。スプラッシュ/Android背景はアイコンと同じ teal `#05AEA9`。
- i18n：en プライマリ / ja。Web（Playwright）で全画面の見た目をデザインと照合済み。

## 残タスク

- [ ] **長押しドラッグでの並び替え**（SPEC §4/§8）。`sortOrder` 更新の口（`reorderItems`）は実装済み。UI は未実装（`react-native-draggable-flatlist` 導入が有力）。
- [ ] **手動レビュー導線**（ドロワー「レビューして応援する」）を App Store の `?action=write-review` URL へ。現在はトースト（App Store ID 未定）。
- [ ] **アプリ名**：端末表示名は `app.json` の「やったこと管理」固定（言語非連動）。英語圏で「Done Log」表示にするなら iOS の `CFBundleDisplayName` ローカライズが別途必要（未対応）。
- [ ] **広告**：初版は広告なしでリリース（方針A）。AdMob は後日追加（`react-native-google-mobile-ads`／Expo Go 不可・Dev Build 化が必要）。
- [ ] **実機での通知/レビュー/スプラッシュ動作確認**（Web では検証不可）。`expo prebuild` 後に確認。
- [ ] **リリース前に `src/lib/dev.ts` の `SEED` を false**（実日付・空起動）。
- [ ] ストア用スクリーンショット（`to done/store/` 準拠で ja/en）。

## 既知の事項 / 設計判断

- 月チップ色は各タスクのタグ色（SPEC §4）。モックの名前別色は非採用（[DESIGN.md](DESIGN.md) 参照）。
- 絞り込みのタグは既定で未選択（空＝全件表示、選んだタグのみ表示）。
- Web プレビューは in-memory モックデータ（実 DB は native のみ）。WSL2 では Metro 再起動が必要なことがある。
- `@gorhom/bottom-sheet` は依存に入っているが、デザイン精度と web 互換のため自作 `BottomSheet`（reanimated）を採用。整理時に依存削除可。

## 検証メモ

- `npm run typecheck` グリーン。Web で Daily/Month/Add/Filter/Drawer/DatePopover/TagEdit/Onboarding を目視確認しデザイン一致。
- 実機（Expo Go）での最終確認はユーザー側で実施予定。
