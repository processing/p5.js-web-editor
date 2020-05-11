const path = require('path');

module.exports = {
  stories: ['../client/**/*.stories.(jsx|mdx)'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-docs',
    '@storybook/addon-knobs',
    '@storybook/addon-links',
    'storybook-addon-theme-playground/dist/register'
  ],
  webpackFinal: async config => {
    // do mutation to the config

    const rules = config.module.rules;

    // modify storybook's file-loader rule to avoid conflicts with svgr
    const fileLoaderRule = rules.find(rule => rule.test.test('.svg'));
    fileLoaderRule.exclude = path.resolve(__dirname, '../client');

    // use svgr for svg files
    rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    })

    return config;
  },
};
