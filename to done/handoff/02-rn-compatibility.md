# RN Compatibility Pass — web-only constructs in the mock → React Native equivalents

The HTML mock is the **visual spec**. React Native is not a browser, so a few CSS
features used in the mock don't exist or behave differently. This table tells the
implementer exactly how to reproduce each one so the result looks identical.

> Rule of thumb: **layout = Flexbox (already RN-native), the gaps below are the only
> things that need conscious translation.**

| # | In the mock (CSS) | Where it's used | RN equivalent / action |
|---|---|---|---|
| 1 | `transform: scale()` on `#scaler` | Fits the 390×844 canvas to the viewport | **Delete entirely.** RN renders to the real device; use `SafeAreaView` + flex. The phone bezel/`.phone` is a mock-only frame — do not implement it. |
| 2 | `position: absolute; inset: 0` screens + `translateX` transitions | Daily↔Month, sheets, drawer, detail | Use the **navigator / Modal**, not manual transforms. Daily/Month = a top tab or a sw1pe pager (`react-native-pager-view`). Sheets = `@gorhom/bottom-sheet` or `Modal`. Drawer = `react-native-drawer-layout`. |
| 3 | `<input type="time">` | Add/Edit sheet → 時刻 | **`@react-native-community/datetimepicker`** (mode="time"). Render the chosen value in a pressable field styled like `.daterow`. |
| 4 | `<input type="text" / textarea>` | task name, memo, new-tag name | `<TextInput>` (multiline for memo). Same bg `color.field`, radius `radius.field`, padding 15×16. |
| 5 | `backdrop-filter: blur()` | onboarding notif banner | Not supported in core RN. Use **`expo-blur`** `<BlurView intensity={20}>` **or** just a solid `rgba(255,255,255,0.96)` (visually fine). |
| 6 | `text-shadow` | month chip labels (white on light bands) | RN `<Text>` supports `textShadowColor / textShadowOffset / textShadowRadius`. Map: `textShadowColor:'rgba(0,0,0,0.22)', textShadowOffset:{width:0,height:0.5}, textShadowRadius:1`. |
| 7 | `box-shadow` | cards, FAB, sheet, popover, drawer | Use the `shadow.*` presets in `theme.ts` (iOS `shadow*` + Android `elevation`). RN can't do inset or multiple shadows — none are needed here. |
| 8 | `::-webkit-scrollbar { display:none }` | lists | RN: `showsVerticalScrollIndicator={false}`. |
| 9 | `letter-spacing` (px, incl. negative) | chips, pro badge | RN `letterSpacing` takes a number (pt). `-0.2` chip, `0.5` pro badge → pass as-is. |
| 10 | `linear-gradient` | **none used** | n/a (design intentionally avoids gradients). If you ever need one: `expo-linear-gradient`. |
| 11 | `:active` pressed states | buttons, rows, tabs | Wrap in **`<Pressable>`** and apply the `:active` style when `pressed` (e.g. bg `color.bgSoft`, or `opacity:0.6` for the date button). |
| 12 | `position: sticky` | **none** | n/a. |
| 13 | `gap` in fl/ex/grid | rows, chips, dots | Supported in RN 0.71+. If on older RN, use margins. |
| 14 | CSS `grid` (month calendar, tag picker, mini-cal) | month `#grid`, date picker, tag swatches | RN has no grid. Reproduce 7-col calendar with **flex rows of 7** (`flexDirection:'row'` + each cell `flexBasis:'14.285%'`) or `FlatList numColumns={7}`. |
| 15 | `aspect-ratio` | (mini-cal cells) | RN supports `aspectRatio` style — pass as-is. |
| 16 | `localStorage` | onboarding "seen" flag | **`@react-native-async-storage/async-storage`** (`todone_onboarded`). |
| 17 | `white-space: nowrap` / `text-overflow: ellipsis` | task title, headings | RN `<Text numberOfLines={1}>` (+ `ellipsizeMode="tail"`). |
| 18 | `font-variant-numeric: tabular-nums` | task time `08:00` | RN: `fontVariant:['tabular-nums']`. |
| 19 | SVG icons (inline `<svg>`) | everywhere | **`react-native-svg`**. All icons are exported individually in `./icons/` — wrap each in an RN `<Svg>` component (see `04-component-map.md`). |
| 20 | Pointer/swipe (`pointerdown/up`) | day swipe, tab swipe, onboarding | **`react-native-gesture-handler`** `PanGestureHandler` / `Swipeable`, or the pager's native swipe. Threshold in mock = 55pt horizontal, must exceed 1.2× vertical. |
| 21 | `cursor`, hover | — | Irrelevant on mobile; ignore. |

## Status bar & safe areas
The mock hard-codes a 54pt status bar and a 22pt bottom inset for the tab bar.
In RN **do not hard-code these** — use `react-native-safe-area-context`
(`useSafeAreaInsets()`), and the `9:41` time / signal icons come from the real OS.

## Fonts
System stack only (SF Pro + Hiragino Sans = iOS default). No custom font to bundle.
Weights used: 400/500/600/700/800 — all available in the system face.

## What is mock-only (DO NOT build)
- The black phone bezel / rounded `.phone` frame and the `#scaler` transform.
- The fake status-bar glyphs and home indicator (the OS draws these).
- Any `/*TEMP*/` lines (none ship; they were preview helpers).
