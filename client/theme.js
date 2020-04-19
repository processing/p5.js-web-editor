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

export const prop = key => (props) => {
  const value = props.theme[key];

  if (value == null) {
    throw new Error(`themed prop ${key} not found`);
  }

  return value;
};

export default {
  [Theme.light]: {
    colors,
    ...common,
    primaryTextColor: '#333',

    buttonColor: '#000',
    buttonColorBackground: '#f4f4f4',
    buttonBorderColor: '#b5b5b5',
    buttonHoverColor: '#fff',
    buttonHoverColorBackground: colors.p5pink,
    buttonDisabledColor: '#f10046',
    buttonDisabledColorBackground: '#fff',
  },
  [Theme.dark]: {
    colors,
    ...common,
    primaryTextColor: '#FFF',

    buttonColor: '#000',
    buttonColorBackground: '#f4f4f4',
    buttonBorderColor: '#b5b5b5',
    buttonHoverColor: '#fff',
    buttonHoverColorBackground: colors.p5pink,
    buttonDisabledColor: '#f10046',
    buttonDisabledColorBackground: '#fff',
  },
  [Theme.contrast]: {
    colors,
    ...common,
    primaryTextColor: '#F5DC23',

    buttonColor: '#000',
    buttonColorBackground: colors.yellow,
    buttonBorderColor: '#b5b5b5',
    buttonHoverColor: '#333',
    buttonHoverColorBackground: '#fff',
    buttonDisabledColor: '#333',
    buttonDisabledColorBackground: colors.yellow,
  },
};
