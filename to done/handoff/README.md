# To Done — Claude Code Handoff

A developer package so the **React Native (Expo)** build matches the approved
design as closely as possible. The HTML mock (`../To Done.html`) is the visual
source of truth; everything here translates it for RN.

## Read in this order
1. **`theme.ts`** — design tokens (colors, type, spacing, radii, shadows, sizes, motion). Drop into the app and reference everywhere.
2. **`02-rn-compatibility.md`** — the only CSS features that need conscious RN translation (most important file). Lists libraries to add.
3. **`03-screen-specs.md`** — every screen, state, and measurement.
4. **`04-component-map.md`** — HTML→RN component map, the data model + seed data, interactions, and onboarding copy.
5. **`icons/`** — SVG icons for `react-native-svg` (+ `icons/README.md`).
6. **`screenshots/`** — high-res "ground truth" images of every screen & state. Diff your build against these.

## How to use with Claude Code
> "Implement this Expo app from `handoff/`. Use `theme.ts` for all tokens, follow
> `03-screen-specs.md` per screen, apply `02-rn-compatibility.md` for any web-only
> CSS, and match `screenshots/` visually. Don't build the phone bezel/scaler."

## Suggested dependencies
- `@react-navigation/*` (or `expo-router`) + `react-native-screens`, `react-native-safe-area-context`
- `react-native-gesture-handler`, `react-native-reanimated`
- `@gorhom/bottom-sheet` (or core `Modal`)
- `react-native-drawer-layout`
- `react-native-svg`
- `@react-native-community/datetimepicker`
- `@react-native-async-storage/async-storage`
- `react-native-pager-view` (onboarding)
- optional: `expo-blur` (notif banner blur)

## Fidelity notes (why it's "near", not literally, 100%)
- RN ≠ browser: shadows, fonts, and pickers render slightly differently per-OS — the tokens + screenshots keep it visually identical.
- Use OS chrome (status bar, home indicator, safe areas) instead of the mock's faked versions.
- Spacing/sizes are pt-for-pt; if anything looks off, trust `screenshots/` then `03-screen-specs.md`.

## Suggested target structure
```
app/
  theme.ts                 ← from here
  screens/ DailyScreen, MonthScreen, Onboarding, TagEdit
  components/ AppHeader, TaskRow, CheckRing, Fab, MonthGrid, Chip,
              AddEditSheet, FilterSheet, Drawer, DatePopover, Segmented, BottomTabBar
  icons/                   ← from here (wrapped in react-native-svg)
  state/ store.ts          ← data model in 04-component-map.md
```
