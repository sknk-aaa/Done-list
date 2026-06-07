/**
 * Done-list — Design Tokens (single source of truth)
 * Ported from to done/handoff/theme.ts (approved HTML mock).
 * All sizes are in points (RN default == iOS pt == CSS px in the mock).
 */

export const lightColors = {
  // Brand / accent (monochrome, near-black)
  teal: '#1C1F24',
  tealDark: '#333333',
  tealTint: 'rgba(0,0,0,0.10)', // today pill bg, light fills
  onAccent: '#FFFFFF', // text/icons on top of the accent

  // Neutrals
  ink: '#2C2E33', // primary text
  ink2: '#3A3F44', // strong secondary (headings, icons)
  muted: '#6E747C', // secondary text (AA on #FAFAFA)
  faint: '#868C93', // placeholders / hints / dim
  line: '#EDEEF0', // hairline dividers / cell borders
  divider: '#E2E5E8', // grab handle, dots
  bg: '#FAFAFA', // screen background
  bgSoft: '#F6F7F8', // pressed states, inset fields, drawer panel
  surface: '#FFFFFF', // cards, sheets, tab bar
  field: '#F3F4F5', // input field background
  segTrack: '#F0F1F2', // segmented-control track
  segActive: '#FFFFFF', // selected segment pill (light chip)
  switchOff: '#DFE2E5', // toggle off track
  selectedCell: '#EEF4F8', // month selected cell bg
  filterBg: '#E9F1F7', // active-filter banner bg
  filterText: '#2A6483', // active-filter banner text
  headerBg: '#FAFAFA', // daily/month header background
  tabBarBg: '#FAFAFA', // bottom tab bar (footer) background
  listBg: '#FAFAFA', // daily task list background

  // Tag / status palette (soft) — shared across themes
  blue: '#4D8BD6',
  green: '#4FB89F',
  orange: '#E5944E',
  purple: '#8C61B2',
  gold: '#E0B850',
  pink: '#E579A0',
  red: '#df5a53',
  gray: '#A7ADB3',

  white: '#FFFFFF', // on-accent text
  chevron: '#C5CACE',
  scrim: 'rgba(20,24,28,0.38)',
  statusBarIcon: '#000000',
};

export type Colors = typeof lightColors;

// Subtle-navy dark palette (Pro). Accent + tag colors stay the same.
export const darkColors: Colors = {
  teal: '#E8EAED',
  tealDark: '#C7CBD1',
  tealTint: 'rgba(232,234,237,0.16)',
  onAccent: '#1A1D24',

  ink: '#E8EAED',
  ink2: '#D4D8DE',
  muted: '#9AA1AC',
  faint: '#6F7884',
  line: '#2A313D',
  divider: '#323A46',
  bg: '#161A22',
  bgSoft: '#1E2430',
  surface: '#1E2430',
  field: '#232A36',
  segTrack: '#232A36',
  segActive: '#EEF0F3',
  switchOff: '#3A434F',
  selectedCell: '#1E2E3C',
  filterBg: '#17293A',
  filterText: '#7CB2D2',
  headerBg: '#161A22',
  tabBarBg: '#161A22',
  listBg: '#161A22',

  blue: '#4D8BD6',
  green: '#4FB89F',
  orange: '#E5944E',
  purple: '#8C61B2',
  gold: '#E0B850',
  pink: '#E579A0',
  red: '#FF6B62',
  gray: '#A7ADB3',

  white: '#FFFFFF',
  chevron: '#5A636F',
  scrim: 'rgba(0,0,0,0.50)',
  statusBarIcon: '#FFFFFF',
};

// Back-compat default (light). Prefer useColors() in components for theming.
export const color = lightColors;

/** Tag categories → color. Tag dot + the colored check ring use this. */
export const tagColor: Record<string, string> = {
  仕事: color.blue,
  健康: color.green,
  買い物: color.orange,
  家事: color.pink,
  自己投資: color.purple,
  学習: color.gold,
};

/** Preset colors for tag creation (tag-edit swatch row). */
export const presetColors: string[] = [
  '#4D8BD6', // blue
  '#49B6AC', // teal
  '#4FB89F', // green
  '#E5944E', // orange
  '#E0B850', // gold
  '#E579A0', // pink
  '#E5685E', // red
  '#8C61B2', // purple
  '#6477D6', // indigo
  '#A7ADB3', // gray
];

/**
 * Month-view chip color is keyed by the recurring task NAME (not the daily tag),
 * matching the approved month design.
 */
export const monthChipColor: Record<string, string> = {
  ブログ更新: color.blue,
  ジム: color.green,
  散歩: color.green,
  買い出し: color.gray,
  家計簿: color.orange,
  資料作成: color.purple,
  英語: color.gold,
  読書: color.pink,
  掃除: color.teal,
  通院: color.red,
};

export const font = {
  // System stack: SF Pro (Latin) + Hiragino Sans (JP) = RN default on iOS.
  family: undefined as undefined, // => System
  size: {
    chip: 10, // month chips
    micro: 11, // pro badge, tiny labels
    caption: 12.5, // date sub-line, tag label, drawer row subtitle
    small: 13, // mock head, drawer section label
    body: 14, // task time, field label, drawer seg buttons
    bodyL: 15, // onboarding paragraph
    title: 16, // task title, drawer row title
    input: 18, // sheet inputs
    h2: 20, // header date (dh-main / ym), sheet title, add-input(20/700)
    h1: 21, // drawer app name, onboarding h2
    date: 24, // (legacy big date — current header uses 20)
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800', // pro badge
  },
} as const;

export const radius = {
  chip: 4,
  field: 12,
  card: 14,
  cardL: 16,
  sheetTop: 26, // bottom sheets, top corners only
  pill: 999,
  circle: 9999,
} as const;

export const space = {
  screenX: 20, // daily list horizontal padding
  headerX: 20,
  sheetX: 22,
  gutter: 16,
} as const;

/**
 * Shadows. iOS uses shadow*; Android uses elevation. Provide both.
 */
export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  fab: {
    shadowColor: '#4A8CB0',
    shadowOpacity: 0.40,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  sheet: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -10 },
    elevation: 16,
  },
  popover: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
} as const;

/** Fixed component dimensions pulled from the mock. */
export const size = {
  statusBarH: 54, // use SafeAreaView in RN instead
  headerPadTop: 6,
  tabBarH: 64, // visual height; + safe-area inset at bottom
  tabBarSafeBottom: 22,
  fab: 64,
  fabIcon: 30,
  statusCircle: 25, // task check ring (border 2)
  statusCheck: 14, // checkmark glyph inside ring
  todayPill: 20, // month-grid "today" circle
  filterDot: 9, // active-filter dot on funnel icon
  drawerWidthPct: 0.84, // drawer = 84% of screen width
  sheetMaxHeightPct: 0.92,
  switch: { w: 46, h: 27, knob: 21, pad: 3 },
} as const;

/** Motion. */
export const motion = {
  screenSlide: { duration: 340 }, // tab/sheet/drawer; ease cubic-bezier(0.4,0,0.2,1)
  popover: { duration: 180 },
  toggle: { duration: 200 },
  dot: { duration: 250 },
} as const;

export const theme = { color, tagColor, monthChipColor, font, radius, space, shadow, size, motion };
export default theme;
