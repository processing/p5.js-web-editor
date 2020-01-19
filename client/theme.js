export const Theme = {
  contrast: 'contrast',
  dark: 'dark',
  light: 'light',
};

export const colors = {
  p5pink: '#ed225d',
  yellow: '#f5dc23',
};

export const common = {
  baseFontSize: 12
};

export const remSize = size => `${size / common.baseFontSize}rem`;

export const prop = key => props => props.theme[key];

export default {
  [Theme.light]: {
    colors,
    ...common,
    primaryTextColor: '#333',

    buttonColor: '#f10046',
    buttonColorBackground: '#fff',
    buttonBorderColor: '#b5b5b5',
    buttonHoverColor: '#fff',
    buttonHoverColorBackground: colors.p5pink,
  },
  [Theme.dark]: {
    colors,
    ...common,
    primaryTextColor: '#FFF',

    buttonColor: '#f10046',
    buttonColorBackground: '#fff',
    buttonBorderColor: '#b5b5b5',
    buttonHoverColor: '#fff',
    buttonHoverColorBackground: colors.p5pink,
  },
  [Theme.contrast]: {
    colors,
    ...common,
    primaryTextColor: '#F5DC23',

    buttonColor: '#333',
    buttonColorBackground: colors.yellow,
    buttonBorderColor: '#b5b5b5',
    buttonHoverColor: '#333',
    buttonHoverColorBackground: '#fff',
  },
};
