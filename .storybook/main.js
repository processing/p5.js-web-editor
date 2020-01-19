module.exports = {
  stories: ['../client/**/*.stories.(jsx|js|mdx)'],
  addons: ['@storybook/addon-actions', '@storybook/addon-docs', '@storybook/addon-knobs', '@storybook/addon-links'],
  webpackFinal: async config => {
    // do mutation to the config

    return config;
  },
};
