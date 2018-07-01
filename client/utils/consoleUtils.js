import warnLightUrl from '../images/console-warn-light.svg';
import warnDarkUrl from '../images/console-warn-dark.svg';
import errorLightUrl from '../images/console-error-light.svg';
import errorDarkUrl from '../images/console-error-dark.svg';
import debugLightUrl from '../images/console-debug-light.svg';
import debugDarkUrl from '../images/console-debug-dark.svg';
import infoLightUrl from '../images/console-info-light.svg';
import infoDarkUrl from '../images/console-info-dark.svg';

export const hijackConsoleErrorsScript = `
  // catch reference errors, via http://stackoverflow.com/a/12747364/2994108
  window.onerror = function (msg, url, lineNumber, columnNo, error) {
    let data = msg + ' (' + 'sketch' + ': line ' + lineNumber + ')';// eslint-disable-line
    window.parent.postMessage([{
      method: 'error',
      arguments: data,
      source: lineNumber // eslint-disable-line
    }], '*');
    return false;
  };`;

export const startTag = '@fs-';

export const CONSOLE_FEED_WITHOUT_ICONS = {
  LOG_WARN_ICON: 'none',
  LOG_ERROR_ICON: 'none',
  LOG_DEBUG_ICON: 'none',
  LOG_INFO_ICON: 'none'
};

export const CONSOLE_FEED_LIGHT_STYLES = {
  BASE_BACKGROUND_COLOR: '',
  LOG_ERROR_BACKGROUND: 'hsl(0, 100%, 97%)',
  LOG_ERROR_COLOR: '#D11518',
  LOG_ERROR_BORDER: 'hsl(0, 100%, 92%)',
  LOG_WARN_BACKGROUND: 'hsl(50, 100%, 95%)',
  LOG_WARN_COLOR: '#FAAF00',
  LOG_WARN_BORDER: 'hsl(50, 100%, 88%)',
  LOG_INFO_COLOR: '#7D7D7D',
  LOG_DEBUG_COLOR: '#007BBB',
  LOG_COLOR: 'rgb(128, 128, 128)',
  LOG_WARN_ICON: `url(${warnLightUrl})`,
  LOG_ERROR_ICON: `url(${errorLightUrl})`,
  LOG_DEBUG_ICON: `url(${debugLightUrl})`,
  LOG_INFO_ICON: `url(${infoLightUrl})`
};

export const CONSOLE_FEED_DARK_STYLES = {
  BASE_BACKGROUND_COLOR: '',
  BASE_COLOR: 'white',
  OBJECT_NAME_COLOR: 'white',
  OBJECT_VALUE_NULL_COLOR: 'hsl(230, 100%, 80%)',
  OBJECT_VALUE_UNDEFINED_COLOR: 'hsl(230, 100%, 80%)',
  OBJECT_VALUE_REGEXP_COLOR: 'hsl(230, 100%, 80%)',
  OBJECT_VALUE_STRING_COLOR: 'hsl(230, 100%, 80%)',
  OBJECT_VALUE_SYMBOL_COLOR: 'hsl(230, 100%, 80%)',
  OBJECT_VALUE_NUMBER_COLOR: 'hsl(230, 100%, 80%)',
  OBJECT_VALUE_BOOLEAN_COLOR: 'hsl(230, 100%, 80%)',
  OBJECT_VALUE_FUNCTION_KEYWORD_COLOR: 'hsl(230, 100%, 80%)',
  LOG_ERROR_BACKGROUND: 'hsl(0, 100%, 8%)',
  LOG_ERROR_COLOR: '#df3a3d',
  LOG_WARN_BACKGROUND: 'hsl(50, 100%, 10%)',
  LOG_WARN_COLOR: '#f5bc38',
  LOG_INFO_COLOR: '#a3a3a3',
  LOG_DEBUG_COLOR: '#0c99e2',
  LOG_WARN_ICON: `url(${warnDarkUrl})`,
  LOG_ERROR_ICON: `url(${errorDarkUrl})`,
  LOG_DEBUG_ICON: `url(${debugDarkUrl})`,
  LOG_INFO_ICON: `url(${infoDarkUrl})`,
  TABLE_BORDER_COLOR: 'grey',
  TABLE_TH_BACKGROUND_COLOR: 'transparent',
  TABLE_TH_HOVER_COLOR: 'grey',
  TABLE_SORT_ICON_COLOR: 'grey',
  TABLE_DATA_BACKGROUND_IMAGE: 'grey',
  TABLE_DATA_BACKGROUND_SIZE: 'grey'

};

export const CONSOLE_FEED_CONTRAST_STYLES = CONSOLE_FEED_DARK_STYLES;
