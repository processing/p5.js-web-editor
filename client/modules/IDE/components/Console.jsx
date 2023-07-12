import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { bindActionCreators } from 'redux';

import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { Console as ConsoleFeed } from 'console-feed';
import warnLightUrl from '../../../images/console-warn-light.svg?byUrl';
import warnDarkUrl from '../../../images/console-warn-dark.svg?byUrl';
import warnContrastUrl from '../../../images/console-warn-contrast.svg?byUrl';
import errorLightUrl from '../../../images/console-error-light.svg?byUrl';
import errorDarkUrl from '../../../images/console-error-dark.svg?byUrl';
import errorContrastUrl from '../../../images/console-error-contrast.svg?byUrl';
import debugLightUrl from '../../../images/console-debug-light.svg?byUrl';
import debugDarkUrl from '../../../images/console-debug-dark.svg?byUrl';
import debugContrastUrl from '../../../images/console-debug-contrast.svg?byUrl';
import infoLightUrl from '../../../images/console-info-light.svg?byUrl';
import infoDarkUrl from '../../../images/console-info-dark.svg?byUrl';
import infoContrastUrl from '../../../images/console-info-contrast.svg?byUrl';
import ConsoleInput from './ConsoleInput';

import commandLightUrl from '../../../images/console-command-light.svg?byUrl';
import resultLightUrl from '../../../images/console-result-light.svg?byUrl';
import commandDarkUrl from '../../../images/console-command-dark.svg?byUrl';
import resultDarkUrl from '../../../images/console-result-dark.svg?byUrl';
import commandContrastUrl from '../../../images/console-command-contrast.svg?byUrl';
import resultContrastUrl from '../../../images/console-result-contrast.svg?byUrl';

import UpArrowIcon from '../../../images/up-arrow.svg';
import DownArrowIcon from '../../../images/down-arrow.svg';

import * as IDEActions from '../../IDE/actions/ide';
import * as ConsoleActions from '../../IDE/actions/console';
import { useDidUpdate } from '../hooks/custom-hooks';
import useHandleMessageEvent from '../hooks/useHandleMessageEvent';
import { listen } from '../../../utils/dispatcher';

const CONSOLE_FEED_LIGHT_STYLES = {
  BASE_BACKGROUND_COLOR: '',
  LOG_ERROR_BACKGROUND: 'hsl(0, 100%, 97%)',
  LOG_ERROR_COLOR: '#D11518',
  LOG_ERROR_BORDER: 'hsl(0, 100%, 92%)',
  LOG_WARN_BACKGROUND: 'hsl(50, 100%, 95%)',
  LOG_WARN_COLOR: '#996B00',
  LOG_WARN_BORDER: 'hsl(50, 100%, 88%)',
  LOG_INFO_COLOR: '#4D4D4D',
  LOG_DEBUG_COLOR: '#0071AD',
  LOG_DEBUG_BACKGROUND: '#D6F1FF',
  LOG_DEBUG_BORDER: '#C2EBFF',
  LOG_COLOR: '#4D4D4D',
  ARROW_COLOR: '#666',
  OBJECT_NAME_COLOR: '#333',
  OBJECT_VALUE_NULL_COLOR: '#747474',
  OBJECT_VALUE_UNDEFINED_COLOR: '#747474',
  OBJECT_VALUE_STRING_COLOR: '#47820A',
  OBJECT_VALUE_REGEXP_COLOR: '#A06801',
  OBJECT_VALUE_NUMBER_COLOR: '#333',
  OBJECT_VALUE_BOOLEAN_COLOR: '#D52889',
  OBJECT_VALUE_FUNCTION_KEYWORD_COLOR: '#0B7CA9',
  LOG_AMOUNT_BACKGROUND: '#5276B7',
  LOG_AMOUNT_COLOR: '#FFF',
  LOG_WARN_AMOUNT_BACKGROUND: '#996B00',
  LOG_ERROR_AMOUNT_BACKGROUND: '#D11518',
  LOG_DEBUG_AMOUNT_BACKGROUND: '#0071AD'
};

const CONSOLE_FEED_DARK_STYLES = {
  BASE_BACKGROUND_COLOR: '',
  BASE_COLOR: 'white',
  OBJECT_NAME_COLOR: 'white',
  OBJECT_VALUE_NULL_COLOR: '#DE4A9B',
  OBJECT_VALUE_UNDEFINED_COLOR: '#DE4A9B',
  OBJECT_VALUE_REGEXP_COLOR: '#EE9900',
  OBJECT_VALUE_STRING_COLOR: '#58a10b',
  OBJECT_VALUE_SYMBOL_COLOR: 'hsl(230, 100%, 80%)',
  OBJECT_VALUE_NUMBER_COLOR: 'white',
  OBJECT_VALUE_BOOLEAN_COLOR: '#DE4A9B',
  OBJECT_VALUE_FUNCTION_KEYWORD_COLOR: '#b58318',
  LOG_ERROR_BACKGROUND: '#1F0000',
  LOG_ERROR_COLOR: '#DF3A3D',
  LOG_WARN_BACKGROUND: 'hsl(50, 100%, 10%)',
  LOG_WARN_COLOR: '#F5BC38',
  LOG_INFO_COLOR: '#D9D9D9',
  LOG_INFO_BORDER: '#4D4D4D',
  LOG_COLOR: '#D9D9D9',
  LOG_DEBUG_COLOR: '#0C99E2',
  LOG_DEBUG_BACKGROUND: '#05232E',
  LOG_DEBUG_BORDER: '#0C546E',
  TABLE_BORDER_COLOR: 'grey',
  TABLE_TH_BACKGROUND_COLOR: 'transparent',
  TABLE_TH_HOVER_COLOR: 'grey',
  TABLE_SORT_ICON_COLOR: 'grey',
  TABLE_DATA_BACKGROUND_IMAGE: 'grey',
  TABLE_DATA_BACKGROUND_SIZE: 'grey',
  ARROW_COLOR: '#D9D9D9',
  LOG_AMOUNT_BACKGROUND: '#5276B7',
  LOG_AMOUNT_COLOR: '#333',
  LOG_WARN_AMOUNT_BACKGROUND: '#996B00',
  LOG_ERROR_AMOUNT_BACKGROUND: '#D11518',
  LOG_DEBUG_AMOUNT_BACKGROUND: '#0071AD'
};

const CONSOLE_FEED_CONTRAST_STYLES = {
  BASE_BACKGROUND_COLOR: '',
  BASE_COLOR: 'white',
  OBJECT_NAME_COLOR: 'white',
  OBJECT_VALUE_NULL_COLOR: '#FFA9D9',
  OBJECT_VALUE_UNDEFINED_COLOR: '#FFA9D9',
  OBJECT_VALUE_REGEXP_COLOR: '#2DE9B6',
  OBJECT_VALUE_STRING_COLOR: '#2DE9B6',
  OBJECT_VALUE_SYMBOL_COLOR: '#B3BEFF',
  OBJECT_VALUE_NUMBER_COLOR: '#FFA9D9',
  OBJECT_VALUE_BOOLEAN_COLOR: '#FFA9D9',
  OBJECT_VALUE_FUNCTION_KEYWORD_COLOR: '#F5DC23',
  LOG_ERROR_BACKGROUND: '#1F0000',
  LOG_ERROR_COLOR: '#EA7B7D',
  LOG_WARN_BACKGROUND: 'hsl(50, 100%, 10%)',
  LOG_WARN_COLOR: '#F5BC38',
  LOG_INFO_COLOR: '#D9D9D9',
  LOG_INFO_BORDER: '#4D4D4D',
  LOG_COLOR: '#D9D9D9',
  LOG_DEBUG_COLOR: '#38B6F5',
  LOG_DEBUG_BACKGROUND: '#05232E',
  LOG_DEBUG_BORDER: '#0C546E',
  TABLE_BORDER_COLOR: 'grey',
  TABLE_TH_BACKGROUND_COLOR: 'transparent',
  TABLE_TH_HOVER_COLOR: 'grey',
  TABLE_SORT_ICON_COLOR: 'grey',
  TABLE_DATA_BACKGROUND_IMAGE: 'grey',
  TABLE_DATA_BACKGROUND_SIZE: 'grey',
  ARROW_COLOR: '#D9D9D9',
  LOG_AMOUNT_BACKGROUND: '#5276B7',
  LOG_AMOUNT_COLOR: '#333',
  LOG_WARN_AMOUNT_BACKGROUND: '#966C08',
  LOG_ERROR_AMOUNT_BACKGROUND: '#DD3134',
  LOG_DEBUG_AMOUNT_BACKGROUND: '#097BB3'
};

const getConsoleFeedStyle = (theme, fontSize) => {
  const style = {
    BASE_FONT_FAMILY: 'Inconsolata, monospace'
  };
  const CONSOLE_FEED_LIGHT_ICONS = {
    LOG_WARN_ICON: `url(${warnLightUrl})`,
    LOG_ERROR_ICON: `url(${errorLightUrl})`,
    LOG_DEBUG_ICON: `url(${debugLightUrl})`,
    LOG_INFO_ICON: `url(${infoLightUrl})`,
    LOG_COMMAND_ICON: `url(${commandLightUrl})`,
    LOG_RESULT_ICON: `url(${resultLightUrl})`
  };
  const CONSOLE_FEED_DARK_ICONS = {
    LOG_WARN_ICON: `url(${warnDarkUrl})`,
    LOG_ERROR_ICON: `url(${errorDarkUrl})`,
    LOG_DEBUG_ICON: `url(${debugDarkUrl})`,
    LOG_INFO_ICON: `url(${infoDarkUrl})`,
    LOG_COMMAND_ICON: `url(${commandDarkUrl})`,
    LOG_RESULT_ICON: `url(${resultDarkUrl})`
  };
  const CONSOLE_FEED_CONTRAST_ICONS = {
    LOG_WARN_ICON: `url(${warnContrastUrl})`,
    LOG_ERROR_ICON: `url(${errorContrastUrl})`,
    LOG_DEBUG_ICON: `url(${debugContrastUrl})`,
    LOG_INFO_ICON: `url(${infoContrastUrl})`,
    LOG_COMMAND_ICON: `url(${commandContrastUrl})`,
    LOG_RESULT_ICON: `url(${resultContrastUrl})`
  };
  const CONSOLE_FEED_SIZES = {
    TREENODE_LINE_HEIGHT: 1.2,
    BASE_FONT_SIZE: `${fontSize}px`,
    ARROW_FONT_SIZE: `${fontSize}px`,
    LOG_ICON_WIDTH: `${fontSize}px`,
    LOG_ICON_HEIGHT: `${1.45 * fontSize}px`
  };

  switch (theme) {
    case 'light':
      return Object.assign(
        CONSOLE_FEED_LIGHT_STYLES || {},
        CONSOLE_FEED_LIGHT_ICONS,
        CONSOLE_FEED_SIZES,
        style
      );
    case 'dark':
      return Object.assign(
        CONSOLE_FEED_DARK_STYLES || {},
        CONSOLE_FEED_DARK_ICONS,
        CONSOLE_FEED_SIZES,
        style
      );
    case 'contrast':
      return Object.assign(
        CONSOLE_FEED_CONTRAST_STYLES || {},
        CONSOLE_FEED_CONTRAST_ICONS,
        CONSOLE_FEED_SIZES,
        style
      );
    default:
      return '';
  }
};

const Console = () => {
  const { t } = useTranslation();
  const consoleEvents = useSelector((state) => state.console);
  const isExpanded = useSelector((state) => state.ide.consoleIsExpanded);
  const isPlaying = useSelector((state) => state.ide.isPlaying);
  const { theme, fontSize } = useSelector((state) => state.preferences);
  const {
    collapseConsole,
    expandConsole,
    clearConsole,
    dispatchConsoleEvent
  } = bindActionCreators({ ...IDEActions, ...ConsoleActions }, useDispatch());

  const cm = useRef({});

  useDidUpdate(() => {
    cm.current.scrollTop = cm.current.scrollHeight;
  });

  const handleMessageEvent = useHandleMessageEvent();
  useEffect(() => {
    const unsubscribe = listen(handleMessageEvent);
    return function cleanup() {
      unsubscribe();
    };
  });

  const consoleClass = classNames({
    'preview-console': true,
    'preview-console--collapsed': !isExpanded
  });

  return (
    <section className={consoleClass}>
      <header className="preview-console__header">
        <h2 className="preview-console__header-title">{t('Console.Title')}</h2>
        <div className="preview-console__header-buttons">
          <button
            className="preview-console__clear"
            onClick={clearConsole}
            aria-label={t('Console.ClearARIA')}
          >
            {t('Console.Clear')}
          </button>
          <button
            className="preview-console__collapse"
            onClick={collapseConsole}
            aria-label={t('Console.CloseARIA')}
          >
            <DownArrowIcon focusable="false" aria-hidden="true" />
          </button>
          <button
            className="preview-console__expand"
            onClick={expandConsole}
            aria-label={t('Console.OpenARIA')}
          >
            <UpArrowIcon focusable="false" aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="preview-console__body">
        <div
          ref={cm}
          className="preview-console__messages"
          style={{ fontSize }}
        >
          <ConsoleFeed
            variant={theme === 'light' ? 'light' : 'dark'}
            styles={getConsoleFeedStyle(theme, fontSize)}
            logs={consoleEvents}
            key={`${theme}-${fontSize}`}
          />
        </div>
        {isExpanded && isPlaying && (
          <ConsoleInput
            theme={theme}
            dispatchConsoleEvent={dispatchConsoleEvent}
            fontSize={fontSize}
          />
        )}
      </div>
    </section>
  );
};

export default Console;
