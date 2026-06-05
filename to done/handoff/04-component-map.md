# HTML → React Native component map + data model + interactions

## A. Component mapping

| Mock element (class/id) | RN component | Notes |
|---|---|---|
| `.phone`, `#scaler` | — | Mock-only frame. Do not build. |
| `.screen#daily` / `#month` | `screens/DailyScreen.tsx` / `MonthScreen.tsx` | Hosted by a top-tab or pager so swipe works. |
| `.tabbar` | Custom bottom bar (or `@react-navigation/bottom-tabs` with a custom tabBar) | icon-only, top hairline, active top-border accent. |
| `.header` + `.dhead`/`.ym` | `components/AppHeader.tsx` | left date button + right icon row. |
| `.tasklist` | `FlatList` | `ItemSeparatorComponent` = 1pt hairline; `showsVerticalScrollIndicator={false}`. |
| `.task` row | `components/TaskRow.tsx` (`Pressable`) | `[CheckRing][TaskMain][TaskTime?]`. |
| `.t-status` | `components/CheckRing.tsx` | colored ring; `done` adds colored check. Own `Pressable` w/ `hitSlop`. |
| `.fab` | `components/Fab.tsx` (`Pressable`) | absolute bottom-right; `shadow.fab`. |
| `.grid` (month) | `components/MonthGrid.tsx` | 7-col via flex rows or `FlatList numColumns={7}`. |
| `.chip` | `components/Chip.tsx` (`Text`) | white text + textShadow; bg from `monthChipColor`. |
| `.sheet#sheet-add` / `#sheet-filter` | `@gorhom/bottom-sheet` (or `Modal` slide-up) | top radius 26; internal `ScrollView`. |
| `.drawer` | `react-native-drawer-layout` (right side) | 84% width; grouped cards inside a `ScrollView`. |
| `.detail#tagedit` | `Modal` / stack screen (slide from right) | push transition. |
| `.datepop` | `components/DatePopover.tsx` in a `Modal` | anchored card + scrim. |
| `.onb` | `screens/Onboarding.tsx` | `react-native-pager-view` + dots + lang toggle. |
| `.seg` segmented | `components/Segmented.tsx` | track + sliding white pill. |
| `.sw` switch | RN `<Switch>` (tint `color.teal`) or custom 46×27. |
| `.backdrop` | `Pressable` full-screen scrim `rgba(20,24,28,0.38)`. |
| inline `<svg>` | `react-native-svg` components in `./icons/` | see §D. |

## B. Data model (TypeScript)

```ts
type Task = {
  id: number;
  title: string;
  tag: string;          // key into tagColor
  color: string;        // = tagColor[tag] (denormalized in the mock)
  done: boolean;
  time?: string;        // 'HH:MM' (24h) or ''
  notify?: boolean;
  memo?: string;
};

// Tasks are keyed by day: state.tasksByDay['2026-5-19'] = Task[]  (key = `${year}-${month0}-${day}`)
// month0 is 0-indexed (June = 5). Only June 2026 has seed data; other days start empty.

type AppState = {
  selectedDate: number;   // day-of-month for the Daily view
  year: number; month: number;  // 0-indexed month, for Daily
  viewYear: number; viewMonth: number; // for the Month grid (independent)
  showTime: boolean;      // Settings ▸ 時刻を表示
  swipeMode: 'date' | 'tab';
  filter: { status: 'all'|'done'|'todo'; tags: Set<string> }; // empty tags = show all
};
const TODAY = { y: 2026, m: 5, d: 19 };
```

Seed data (Daily, June 19) — reproduce exactly:

| id | title | tag | done | time |
|---|---|---|---|---|
| 1 | ブログ更新 | 仕事 | ✓ | 08:00 |
| 2 | ジムで筋トレ | 健康 | ✓ | 07:00 |
| 3 | 買い出し（スーパー） | 買い物 | – | 18:30 |
| 4 | 資料作成（提案書） | 仕事 | ✓ | 14:00 |
| 5 | 読書（20分） | 自己投資 | – | 22:00 |
| 6 | 夕食の準備 | 家事 | ✓ | 19:00 |
| 7 | 英語学習アプリ | 学習 | – | 07:30 |

Month grid seed (per-day recurring chip names) lives in the mock's `cells` array —
copy it verbatim from `To Done.html` (search `var blog=`). Each non-out cell lists
2–4 of: ブログ更新/ジム/買い出し/家計簿/資料作成/英語/読書/掃除/散歩/通院.

Derived rules:
- A day's task count badge & `X/Y完了` = tasks for `selectedDate`.
- Generated (non-curated) days derive `done` as `((day + index) % 3 === 0)` — keep this so Daily and Month agree.
- Filter: a task is visible if `status` matches AND (`tags.size===0` OR `tags.has(task.tag)`). Month chips filter by `monthTagOf(name)` (see `TAGOF` in the mock) + the same derived `done`.

## C. Interactions & motion
- **Tab/sheet/drawer/detail transitions**: 340ms `cubic-bezier(0.4,0,0.2,1)`.
- **Popover**: 180ms fade+scale from top-left origin.
- **Switch**: 200ms; **dots**: 250ms width morph.
- **Check toggle**: instant; recompute `X/Y完了`.
- **Swipe**: see Screen Specs §1. Use gesture-handler; respect `swipeMode`.
- **Onboarding** copy (do not paraphrase):

```ts
const ONB = [
  { ja:['やったことを記録しよう','今日できたことにチェック。小さな積み重ねが、毎日の自信になります。'],
    en:['Track what you did','Check off what you finished today. Small wins build lasting confidence.'] },
  { ja:['デイリーと月ビュー','1日の記録と、月全体の振り返り。タブやスワイプで、いつでも切り替えられます。'],
    en:['Daily & Month views','Log each day and review the whole month. Switch anytime with the tabs or a swipe.'] },
  { ja:['時刻と通知でリマインド','タスクに時刻を設定すると、通知でお知らせ。やり忘れを防げます。'],
    en:['Times & reminders','Set a time on a task and get a notification. Never forget what matters.'] },
];
// buttons: 次へ/始める/スキップ  ↔  Next/Get Started/Skip ; toggle label shows the OTHER language.
```

## D. Icons (in `./icons/`)
Each file is the raw SVG path/markup from the mock. Wrap with `react-native-svg`:
```tsx
import Svg, { Path, Polyline, Rect, Line, Circle, Polygon } from 'react-native-svg';
export const Funnel = ({size=26,color}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
       strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Svg>
);
```
Stroke icons take `color` via the `stroke` prop; the tag/filled icons (tag glyph,
star) take `fill`. Sizes are listed per icon in `icons/README.md`.
