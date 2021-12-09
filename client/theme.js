import lodash from 'lodash';

export const Theme = {
  contrast: 'contrast',
  dark: 'dark',
  light: 'light'
};

export const colors = {
  p5jsPink: '#ed225d',
  processingBlueDark: '#28347D',
  processingBlue: '#2D67F6',
  processingBlueLight: '#8DADF9',
  p5jsActivePink: '#f10046',
  white: '#fff',
  black: '#000',
  yellow: '#f5dc23',
  orange: '#ffa500',
  red: '#ff0000',
  lightsteelblue: '#B0C4DE',
  dodgerblue: '#1E90FF',
  p5ContrastPink: ' #FFA9D9',

  borderColor: ' #B5B5B5',
  outlineColor: '#0F9DD7'
};

export const grays = {
  lightest: '#FFF', // primary
  lighter: '#FBFBFB',

  light: '#F0F0F0', // primary
  mediumLight: '#D9D9D9',
  middleLight: '#A6A6A6',

  middleGray: '#747474', // primary
  middleDark: '#666',
  mediumDark: '#4D4D4D',

  dark: '#333', // primary
  darker: '#1C1C1C',
  darkest: '#000'
};

export const common = {
  baseFontSize: 12,
  shadowColor: 'rgba(0, 0, 0, 0.16)'
};

export const device = {
  desktop: `(min-width: 770px)`
};

export const remSize = (size) => `${size / common.baseFontSize}rem`;

export const prop = (key) => (props) => {
  const keypath = `theme.${key}`;
  const value = lodash.get(props, keypath);

  if (value == null) {
    throw new Error(`themed prop ${key} not found`);
  }

  return value;
};

export default {
  [Theme.light]: {
    colors,
    ...common,
    primaryTextColor: grays.dark,
    inactiveTextColor: grays.middleDark,
    backgroundColor: grays.lighter,

    Button: {
      primary: {
        default: {
          foreground: colors.black,
          background: grays.light,
          border: grays.middleLight
        },
        hover: {
          foreground: grays.lightest,
          background: colors.p5jsPink,
          border: colors.p5jsPink
        },
        active: {
          foreground: grays.lightest,
          background: colors.p5jsActivePink,
          border: colors.p5jsActivePink
        },
        disabled: {
          foreground: colors.black,
          background: grays.light,
          border: grays.middleLight
        }
      },
      secondary: {
        default: {
          foreground: grays.lightest,
          background: colors.p5jsPink,
          border: colors.p5jsPink
        },
        hover: {
          foreground: grays.lightest,
          background: colors.p5jsPink,
          border: colors.p5jsPink
        },
        active: {
          foreground: grays.lightest,
          background: colors.p5jsActivePink,
          border: colors.p5jsActivePink
        },
        disabled: {
          foreground: colors.black,
          background: grays.light,
          border: grays.middleLight
        }
      }
    },
    Icon: {
      default: grays.middleGray,
      hover: grays.darker
    },
    MobilePanel: {
      default: {
        foreground: colors.black,
        background: grays.light,
        border: grays.middleLight
      }
    },
    Modal: {
      background: grays.light,
      border: grays.middleLight,
      separator: grays.middleDark
    },
    Separator: grays.middleLight,

    TabHighlight: colors.p5jsPink,
    SketchList: {
      background: grays.lighter,
      card: {
        background: grays.lighter
      }
    },
    Policy: {
      link: colors.processingBlue
    }
  },
  [Theme.dark]: {
    colors,
    ...common,
    primaryTextColor: grays.lightest,
    inactiveTextColor: grays.middleLight,
    backgroundColor: grays.darker,

    Button: {
      primary: {
        default: {
          foreground: grays.light,
          background: grays.dark,
          border: grays.middleDark
        },
        hover: {
          foreground: grays.lightest,
          background: colors.p5jsPink,
          border: colors.p5jsPink
        },
        active: {
          foreground: grays.lightest,
          background: colors.p5jsActivePink,
          border: colors.p5jsActivePink
        },
        disabled: {
          foreground: grays.light,
          background: grays.dark,
          border: grays.middleDark
        }
      },
      secondary: {
        default: {
          foreground: grays.lightest,
          background: colors.p5jsPink,
          border: colors.p5jsPink
        },
        hover: {
          foreground: grays.lightest,
          background: colors.p5jsPink,
          border: colors.p5jsPink
        },
        active: {
          foreground: grays.lightest,
          background: colors.p5jsActivePink,
          border: colors.p5jsActivePink
        },
        disabled: {
          foreground: grays.light,
          background: grays.dark,
          border: grays.middleDark
        }
      }
    },
    Icon: {
      default: grays.middleLight,
      hover: grays.lightest
    },
    MobilePanel: {
      default: {
        foreground: grays.light,
        background: grays.dark,
        border: grays.middleDark
      }
    },
    Modal: {
      background: grays.dark,
      border: grays.middleDark,
      separator: grays.middleLight
    },
    Separator: grays.middleDark,

    TabHighlight: colors.p5jsPink,
    SketchList: {
      background: grays.darker,
      card: {
        background: grays.dark
      }
    },
    Policy: {
      link: colors.processingBlueLight
    }
  },
  [Theme.contrast]: {
    colors,
    ...common,
    primaryTextColor: grays.lightest,
    inactiveTextColor: grays.light,
    backgroundColor: grays.darker,

    Button: {
      primary: {
        default: {
          foreground: grays.light,
          background: grays.dark,
          border: grays.middleDark
        },
        hover: {
          foreground: grays.dark,
          background: colors.yellow,
          border: colors.yellow
        },
        active: {
          foreground: grays.dark,
          background: colors.p5jsActivePink,
          border: colors.p5jsActivePink
        },
        disabled: {
          foreground: grays.light,
          background: grays.dark,
          border: grays.middleDark
        }
      },
      secondary: {
        default: {
          foreground: grays.dark,
          background: colors.yellow,
          border: colors.yellow
        },
        hover: {
          foreground: grays.dark,
          background: colors.yellow,
          border: colors.yellow
        },
        active: {
          foreground: grays.dark,
          background: colors.p5jsActivePink,
          border: colors.p5jsActivePink
        },
        disabled: {
          foreground: grays.light,
          background: grays.dark,
          border: grays.middleDark
        }
      }
    },
    Icon: {
      default: grays.mediumLight,
      hover: colors.yellow
    },
    MobilePanel: {
      default: {
        foreground: grays.light,
        background: grays.dark,
        border: grays.middleDark
      }
    },
    Modal: {
      background: grays.dark,
      border: grays.middleDark,
      separator: grays.light
    },
    Separator: grays.middleDark,

    TabHighlight: grays.darker,
    SketchList: {
      background: colors.yellow,
      card: {
        background: grays.dark
      }
    },
    Policy: {
      link: colors.processingBlueLight
    }
  }
};
