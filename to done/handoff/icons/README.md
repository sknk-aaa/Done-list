# Icons (react-native-svg source)

All icons are 24×24, `viewBox="0 0 24 24"`. Stroke icons use `stroke="currentColor"`
so you recolor via the `stroke`/`color` prop; filled icons use `fill="currentColor"`.

| file | usage | render size | color source |
|---|---|---|---|
| funnel.svg | header filter | 26 | stroke `color.teal` (+ dot when active) |
| hamburger.svg | header menu | 28 | stroke `#3A3F44` |
| check.svg | task done / sheets / onboarding | 18 (task) | stroke = tag color (task), white on teal (drawer app icon) |
| plus.svg | FAB | 30 | stroke white |
| tag-filled.svg | tag glyph in task subline | 13 | fill = tag color |
| note.svg | memo present | 13 | stroke `#B3B8BD` |
| calendar.svg | sheet date field / mock head | 20 | stroke `#8A8F94` |
| bell.svg | notify (task time + onboarding) | 11–15 | stroke `color.teal` |
| clock.svg | (alt for time field) | 18 | stroke muted |
| chevron-right.svg | date-nav next / drawer chevron | 9–26 | stroke `#C5CACE` (drawer) / muted |
| chevron-left.svg | back buttons | 22 | stroke `color.teal` |
| chevron-down.svg | date field / caret | 18 | stroke `#B0B5B9` |
| tab-daily.svg / tab-month.svg | bottom tab bar | 24 | active `color.teal` / inactive `color.muted` |
| compass.svg | drawer 使い方 | 22 | stroke `#8A9097` |
| question.svg | drawer よくある質問 | 22 | stroke `#8A9097` |
| chat.svg | drawer 不具合・要望を報告 | 22 | stroke `#8A9097` |
| star.svg | drawer レビュー | 22 | stroke `#8A9097` |
| pro-spark.svg | drawer Pro row | 22 | stroke `color.teal` |
| play-circle.svg | drawer オンボーディングを見る | 22 | stroke `#8A9097` |

Note: the header date caret is a pure CSS triangle in the mock — render as a small
`chevron-down` or a triangle (5pt sides, 7pt tall, `#9AA0A6`). Status-bar glyphs
and the home indicator are drawn by the OS — not included here.
