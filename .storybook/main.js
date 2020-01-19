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

    return config;
  },
};
