import type en from './en';

const ja: typeof en = {
  common: {
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    back: '戻る',
    reset: 'リセット',
    done: '完了',
  },
  daily: {
    today: '今日',
    yesterday: '昨日',
    tomorrow: '明日',
    backToToday: '今日へ',
    progress: '{{done}}/{{total}}完了',
    empty: '条件に合うタスクがありません',
  },
  tabs: {
    daily: 'デイリー',
    month: '月ビュー',
  },
};

export default ja;
