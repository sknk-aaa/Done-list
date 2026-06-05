/** Onboarding slide copy (verbatim from handoff/04-component-map.md). */
export type OnbSlide = { ja: [string, string]; en: [string, string] };

export const ONB: OnbSlide[] = [
  {
    ja: ['やったことを記録しよう', '今日できたことにチェック。小さな積み重ねが、毎日の自信になります。'],
    en: ['Track what you did', 'Check off what you finished today. Small wins build lasting confidence.'],
  },
  {
    ja: ['デイリーと月ビュー', '1日の記録と、月全体の振り返り。タブやスワイプで、いつでも切り替えられます。'],
    en: ['Daily & Month views', 'Log each day and review the whole month. Switch anytime with the tabs or a swipe.'],
  },
  {
    ja: ['時刻と通知でリマインド', 'タスクに時刻を設定すると、通知でお知らせ。やり忘れを防げます。'],
    en: ['Times & reminders', 'Set a time on a task and get a notification. Never forget what matters.'],
  },
];
