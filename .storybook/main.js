/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  stories: ['../client/**/*.stories.(jsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-mdx-gfm'
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  },
  async webpackFinal(config) {
    // https://storybook.js.org/docs/react/builders/webpack
    // this modifies the existing image rule to exclude .svg files
    // since we want to handle those files with @svgr/webpack
    const imageRule = config.module.rules.find(rule => rule.test.test('.svg'))
    imageRule.exclude = /\.svg$/

    // configure .svg files to be loaded with @svgr/webpack
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })

    return config
  },
};

export default config;


