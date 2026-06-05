# Screen Specs — measurements, states & behavior

Canvas reference: **390 × 844 pt** (iPhone 13/14). All numbers are pt and come
straight from the mock CSS. Colors reference `theme.ts` (e.g. `color.teal`).

Legend: `tap →` interaction, `state:` visual variants.

---

## 0. Global chrome
- **Header row** (both Daily & Month): horizontal, `paddingTop 6`, `paddingX 20`, `paddingBottom 10`. Left = date/title button, right = `tools` row (gap 18): **funnel** then **hamburger** (hamburger is right-most).
  - Funnel stroke `color.teal` (26pt). Hamburger stroke `#3A3F44` (28pt).
  - state `filter active`: a `9pt` `color.teal` dot at top-right of the funnel (1.5pt bg-colored border).
- **Bottom tab bar**: full width, height 64 + safe-area inset, top hairline `color.line`, **icon-only** (Daily = calendar glyph, Month = grid glyph), 24pt. Active = `color.teal` + a **3pt full-width top border** on the active half. Inactive = `color.muted`.

---

## 1. Daily (デイリー)
Vertical stack: Header → date-nav status line → (optional filter bar) → task list → FAB.

### Header (left side)
- Button `dhead`: row, gap 7.
  - `dh-main`: **6月19日（金）** — 20/700 `color.ink`. + a downward caret triangle (5pt sides, 7pt tall, `#9AA0A6`).
  - below it `dh-status` (paddingX 20, 12.5/500 `color.muted`):
    - state `today`: `今日` in `color.teal`/600 · ` · ` · `4/7完了`
    - state `not today`: a pressable **`↩ 今日へ`** (`color.teal`/700) · `X/Y完了`
- tap `dhead` → **date picker popover** (see §5).
- tap `↩ 今日へ` → jump to today (2026-06-19).

### Task list
- Horizontal padding 20. Rows separated by **1pt `color.line` hairline** (no card, flat).
- **Row** = `[check] [main] [time?]`, align center, gap 14, paddingY 17.
  - **check** (`t-status`): 31pt circle, **2pt border in the tag color**.
    - state `done`: same colored ring + a **checkmark glyph in the tag color** (18pt, stroke 3.4). No fill.
    - state `todo`: colored ring, empty.
    - tap → toggle done (updates `X/Y完了`). Tap must NOT open the editor (stop propagation).
  - **main**: title 16/600 `color.ink` (1 line, ellipsis); subline gap 6 → tag = [6pt dot] + tag-name (12.5/600 in tag color) + memo glyph (13pt `#B3B8BD`) if memo present.
  - **time** (right, only if `Settings ▸ 時刻を表示` ON and task has time): 14/600 `#7C8186`, tabular-nums; if `notify` ON, a 12pt teal **bell** precedes it.
  - tap row → **Edit sheet** (§4) for that task.
- state `empty / filtered to nothing`: centered `条件に合うタスクがありません`, 15pt `#B4B9BD`.

### FAB
- 64pt teal circle, white `+` (30pt, stroke 2.6), bottom-right (right 22, ~bottom 104), `shadow.fab`.
- Hidden on Month view.
- tap → **Add sheet** (§4).

### Filter bar (only when a filter is active)
- Above the list, marginX 16, padding 9×14, bg `#E6F6F4`, radius 10, 13/600 `#0F8A7C`.
- text: `絞り込み中 · <完了のみ/未完了のみ> · タグN件` + right **`解除`** (`color.teal`/700) → clears filter.

### Swipe (Settings-driven)
- Setting `日付の移動` (default): swipe L/R on the screen → next/prev day.
- Setting `タブ切替`: swipe L → Month.
- Month view: swipe R → Daily (always).
- Threshold: |dx| > 55 and |dx| > 1.2·|dy|.

---

## 2. Month (月ビュー)
- Header left = **`2026 / 6月`** button + caret. tap → **month/year picker** (§5, month mode).
- Weekday strip `日 月 火 水 木 金 土`, 15pt `#8A8F94`, paddingX 12.
- **Grid**: 7 columns, auto rows fill height. paddingX 5.
  - **cell**: 0.5pt `#ECEEF0` border, padding `6 / 1.5 / 6`, gap 4.
    - `dnum`: 14/600 `#33383D`, paddingLeft 3. Sundays → `color.red`. Out-of-month → `#C4C8CC`.
    - state `today` (June 19): dnum shown in a **20pt `color.tealTint` circle**, text `color.teal`/700.
    - state `selected`: cell gets 1.5pt `color.teal` border + radius 10 + bg `#F2FBFA` (only when viewed month == selected day's month).
  - **chips** (filtered): full-width bands, radius 4, padding `4.5 / 2`, **10/700 white text + subtle text-shadow**, bg = `monthChipColor[name]`. Max ~4 fit; overflow shows `+N` (`more`, 11pt `color.muted`) — hidden while a filter is active.
- June 2026 uses the curated data; other months render an empty correct-layout calendar (no chips).
- tap a day → jump Daily to that date (and switch to Daily tab).
- Filter applies here too (chips hidden by tag/status).

---

## 3. Drawer (hamburger)
- Slides from right, **84% width**, bg `#F5F6F7` (so white cards pop), `shadow.drawer`.
- Scrollable. Content paddingX 18.
- **App header**: 52pt teal rounded-square (radius 14) app icon w/ white check + `やったこと管理` (21/700) + plan sub `Free` (13 `color.muted`). padding `62 / 6 / 14`.
- Grouped **cards** (`dw-group`): white, radius 14, `shadow.card`; rows divided by 1pt `color.line`.
  - **Pro card**: single row → icon (teal), title `Pro版にアップグレード` (teal/600) + sub `広告なし・タグ無制限・テーマ変更`, chevron. tap → toast.
  - section label `設定` (13/600 `color.muted`, padding `20/8/8`):
    - toggle row `時刻を表示` + **switch** (46×27, knob 21, off `#DFE2E5` / on `color.teal`). → toggles time everywhere.
    - segmented `スワイプ操作`: `画面を左右にスワイプしたとき` label + 2-seg `日付の移動 / タブ切替` (track `#F0F1F2`, active pill white + teal text).
  - section `サポート`: rows `使い方`, `よくある質問`, `不具合・要望を報告`, `レビューして応援する`, `オンボーディングを見る` — each [outline icon 22pt `#8A9097`] + title 16/500 + chevron. tap → toast / replay onboarding.
- Footer: `やったこと管理 v1.0.0`, centered 12pt `#BCC1C6`.
- Backdrop scrim `rgba(20,24,28,0.38)` — tap to close.

---

## 4. Add / Edit sheet (bottom sheet)
- Bottom sheet, top radius 26, paddingX 22, **maxHeight 92%**, scrolls internally.
- Header (`position relative`): left `キャンセル` (`color.muted`), **centered title** (`新規タスク` / `タスクを編集`, 20/700), right `保存` (`color.teal`).
- Fields top→bottom:
  1. `add-input` TextInput, placeholder `やったことを入力`, **20/700** (the name is emphasized), bg `color.field`.
  2. label row `タグ` + right link `タグを編集` (`color.teal`/600 → §6). **Tag picker**: wrap of pills (border 1.5pt; selected → tag color border+text + 8%-alpha bg, leading dot).
  3. `時刻` label + **time field** (`--:--` / value) with trailing clock glyph. *(hidden if 時刻を表示 OFF)*
  4. **`通知を飛ばす`** row (inset field) + switch. *(hidden if 時刻を表示 OFF; this is now FREE — no Pro gate.)*
  5. `日付` field (`2026年6月19日（金）`) + trailing chevron → tap toggles **inline mini-calendar** (7-col grid; selected day teal; pick → set & collapse).
  6. `メモ` multiline TextInput.
  7. **edit mode only**: `このタスクを削除` button (red, full width).
- `保存`: validates name + tag; writes to the chosen day (moving across days if date changed).

---

## 5. Date picker popover (Daily header) / Month-year picker
- Card anchored under the header (top ~92, left 18, width 300), radius 16, `shadow.popover`. Scrim behind.
- **Day mode**: header `‹  2026年6月 ▾  ›` (arrows = ±month; title tap → month mode). Then 7-col day grid; selected = teal fill; today (Jun 19) = teal text. tap day → jump.
- **Month mode**: header `‹  2026年 ▾  ›` (arrows = ±year; title tap → day mode). Then 3×4 grid `1月…12月`; current = teal fill. tap month → (daily ctx) back to day mode / (month ctx) set viewed month & close.
- Reused by the Month header (month mode, ctx=month).

---

## 6. Tag edit (push screen)
- Full screen from right. Bar: `‹ 戻る` (teal) · centered `タグを編集` · spacer.
- `タグ一覧` card: each tag = [13pt dot] name + right `削除` (red).
- `新しいタグ`: name TextInput + color swatch row (34pt circles, selected = 2pt teal ring) + `タグを追加` primary button.

---

## 7. Onboarding (first launch; replayable from drawer)
- Full-screen white overlay, fades in. Top-right **language toggle** pill (`English`/`日本語`).
- 3 swipeable slides (pager). Each: a **mini-mock preview card** (not the real screen) → heading (21/700) → paragraph (15 `color.muted`, max-width ~285).
  - S1 daily-list mock · S2 mini month-calendar mock · S3 task-with-time + notification-banner mock.
- Footer: **dots** (active = 22pt teal bar) + primary button (`次へ` → last `始める` / EN `Next`→`Get Started`) + `スキップ`/`Skip`.
- Persists `todone_onboarded` on finish/skip (AsyncStorage).
- Slide copy (JA / EN) is in `theme`-adjacent `ONB` array — see `05-interactions.md`.
