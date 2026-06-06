export type FaqItem = { q: string; a: string };

export const FAQ: { en: FaqItem[]; ja: FaqItem[] } = {
  en: [
    {
      q: 'What is toDone?',
      a: 'A simple to‑do and done‑log app. Write what you plan to do, check it off when finished, and look back on your record by day or by month.',
    },
    {
      q: 'Where is my data stored? Is it private?',
      a: 'Everything — tasks, tags, and settings — is stored only on your device. Nothing is sent to us or any third party.',
    },
    {
      q: 'How do reminders work?',
      a: 'Set a time on a task and turn on “Send a reminder.” Your device shows a local notification at that time. If reminders don’t appear, allow notifications for toDone in your device Settings.',
    },
    {
      q: 'How are tasks ordered?',
      a: 'When you add a task with a time, it’s placed in time order automatically. Tasks without a time go to the bottom.',
    },
    {
      q: 'How do I move between days and months?',
      a: 'Swipe left/right to move by day (Daily) or month (Calendar). You can also tap the date at the top, or use the arrows in the Calendar. In the menu you can switch the swipe to change the screen instead.',
    },
    {
      q: 'What are tags?',
      a: 'Tags group your tasks by color. Create or remove them from the task sheet via “Edit tags.” In the Calendar, each task’s color comes from its tag.',
    },
    {
      q: 'I deleted a task by mistake.',
      a: 'Right after deleting, a “Task deleted — Undo” message appears at the bottom. Tap Undo to restore it.',
    },
    {
      q: 'What does Pro include?',
      a: 'toDone is free. Pro adds a dark theme and keeps the app ad‑free. You can restore a previous purchase from the menu.',
    },
    {
      q: 'How do I close the add/edit sheet?',
      a: 'Swipe the sheet down, or tap Cancel. Swiping down also dismisses the keyboard.',
    },
  ],
  ja: [
    {
      q: 'toDone とは？',
      a: 'やること・やったことを記録できるシンプルなアプリです。やることを書き、終えたらチェック。その記録を1日・1か月単位で振り返れます。',
    },
    {
      q: 'データはどこに保存されますか？プライバシーは？',
      a: 'タスク・タグ・設定はすべて端末内だけに保存されます。当方や第三者に送信されることはありません。',
    },
    {
      q: '通知（リマインド）の仕組みは？',
      a: 'タスクに時刻を設定し「通知を飛ばす」をオンにすると、その時刻に端末のローカル通知が表示されます。通知が出ない場合は、端末の設定で toDone の通知を許可してください。',
    },
    {
      q: 'タスクの並び順は？',
      a: '時刻付きのタスクを追加すると、自動で時刻順に配置されます。時刻なしのタスクは一番下に入ります。',
    },
    {
      q: '日付や月の移動方法は？',
      a: '左右スワイプで日（デイリー）や月（カレンダー）を移動できます。上部の日付タップや、カレンダーの矢印でも移動可能です。メニューからスワイプを「画面の切替」に変更することもできます。',
    },
    {
      q: 'タグとは？',
      a: 'タスクを色で分類する機能です。タスク画面の「タグを編集」から作成・削除できます。カレンダーの各タスクの色はタグ色になります。',
    },
    {
      q: 'タスクを間違って削除しました。',
      a: '削除直後に画面下へ「タスクを削除しました ／ 元に戻す」が表示されます。元に戻すを押すと復元できます。',
    },
    {
      q: 'Pro には何が含まれますか？',
      a: 'toDone は無料です。Pro にするとダークテーマが使え、広告なしのまま使い続けられます。購入済みの場合はメニューから復元できます。',
    },
    {
      q: '追加／編集シートの閉じ方は？',
      a: 'シートを下にスワイプするか、キャンセルを押してください。下スワイプではキーボードも閉じます。',
    },
  ],
};
