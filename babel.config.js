module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Inline drizzle .sql migrations as strings (required by drizzle-orm/expo-sqlite).
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
