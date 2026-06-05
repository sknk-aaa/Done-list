# Screenshots — visual ground truth

Diff your RN build against these. Two are static PNGs; the rest are best viewed
**live** (the overlay states use slide-in transforms that don't flatten cleanly to
a static image, and look pixel-perfect in a real browser).

## Static images
| file | screen |
|---|---|
| `01-daily.png` | Daily view — task list with check rings, tags, times, FAB, tab bar |
| `02-month.png` | Month view — June 2026 calendar with colored task bands, today (19) highlighted |

## Live states — open the mock and append a URL hash
Open `../To Done.html` in a desktop browser, then load these URLs (the mock has
built-in hooks that auto-open each state on load):

| URL | state to capture |
|---|---|
| `To Done.html#month` | Month view |
| `To Done.html#drawer` | Hamburger drawer (settings: 時刻を表示 toggle, swipe mode, support links) |
| `To Done.html#add` | Add-task bottom sheet (name, tag picker, time, notify toggle, date, memo) |
| `To Done.html#filter` | 絞り込み sheet (status segments + tag checklist) |
| `To Done.html#onb` | Onboarding (3 slides; top-right toggles 日本語/English) |

Other states reachable by interaction (all specced in `03-screen-specs.md`):
- **Edit sheet** — tap any task row (same sheet as Add, titled タスクを編集, with 削除).
- **Date picker popover** — tap the date in the Daily header (day mode → tap title → month/year mode).
- **Month/year picker** — tap `2026 / 6月` in the Month header.
- **Tag edit** — Add/Edit sheet → タグを編集.
- **Filter active** — apply a filter; note the funnel dot + the `絞り込み中 … 解除` bar on Daily.
- **Time OFF** — drawer ▸ 時刻を表示 off; times + notify row disappear.
- **Not-today Daily** — pick another day; header shows `↩ 今日へ`.

> Tip for a clean capture: the mock scales a 390×844 canvas to the window. Size the
> browser window so the phone fills it, or screenshot just the `.phone` element.
