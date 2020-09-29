import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { bindActionCreators } from 'redux';

import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { Console as ConsoleFeed } from 'console-feed';
import {
  CONSOLE_FEED_WITHOUT_ICONS, CONSOLE_FEED_LIGHT_STYLES,
  CONSOLE_FEED_DARK_STYLES, CONSOLE_FEED_CONTRAST_STYLES
} from '../../../styles/components/_console-feed.scss';
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

const getConsoleFeedStyle = (theme, times, fontSize) => {
  const style = {
    BASE_FONT_FAMILY: 'Inconsolata, monospace',
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
    BASE_FONT_SIZE: fontSize,
    ARROW_FONT_SIZE: fontSize,
    LOG_ICON_WIDTH: fontSize,
    LOG_ICON_HEIGHT: 1.45 * fontSize
  };

  if (times > 1) {
    Object.assign(style, CONSOLE_FEED_WITHOUT_ICONS);
  }
  switch (theme) {
    case 'light':
      return Object.assign(CONSOLE_FEED_LIGHT_STYLES, CONSOLE_FEED_LIGHT_ICONS, CONSOLE_FEED_SIZES, style);
    case 'dark':
      return Object.assign(CONSOLE_FEED_DARK_STYLES, CONSOLE_FEED_DARK_ICONS, CONSOLE_FEED_SIZES, style);
    case 'contrast':
      return Object.assign(CONSOLE_FEED_CONTRAST_STYLES, CONSOLE_FEED_CONTRAST_ICONS, CONSOLE_FEED_SIZES, style);
    default:
      return '';
  }
};

const Console = ({ t }) => {
  const consoleEvents = useSelector(state => state.console);
  const isExpanded = useSelector(state => state.ide.consoleIsExpanded);
  const isPlaying = useSelector(state => state.ide.isPlaying);
  const { theme, fontSize } = useSelector(state => state.preferences);

  const {
    collapseConsole, expandConsole, clearConsole, dispatchConsoleEvent
  } = bindActionCreators({ ...IDEActions, ...ConsoleActions }, useDispatch());

  const cm = useRef({});

  useDidUpdate(() => { cm.current.scrollTop = cm.current.scrollHeight; });

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
    <section className={consoleClass} >
      <header className="preview-console__header">
        <h2 className="preview-console__header-title">{t('Console.Title')}</h2>
        <div className="preview-console__header-buttons">
          <button className="preview-console__clear" onClick={clearConsole} aria-label={t('Console.ClearARIA')}>
            {t('Console.Clear')}
          </button>
          <button
            className="preview-console__collapse"
            onClick={collapseConsole}
            aria-label={t('Console.CloseARIA')}
          >
            <DownArrowIcon focusable="false" aria-hidden="true" />
          </button>
          <button className="preview-console__expand" onClick={expandConsole} aria-label={t('Console.OpenARIA')} >
            <UpArrowIcon focusable="false" aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="preview-console__body">
        <div ref={cm} className="preview-console__messages">
          {consoleEvents.map((consoleEvent) => {
            const { method, times } = consoleEvent;
            return (
              <div key={consoleEvent.id} className={`preview-console__message preview-console__message--${method}`}>
                { times > 1 &&
                <div
                  className="preview-console__logged-times"
                  style={{ fontSize, borderRadius: fontSize / 2 }}
                >
                  {times}
                </div>
                }
                <ConsoleFeed
                  styles={getConsoleFeedStyle(theme, times, fontSize)}
                  logs={[consoleEvent]}
                  key={`${consoleEvent.id}-${theme}-${fontSize}`}
                />
              </div>
            );
          })}
        </div>
        { isExpanded && isPlaying &&
          <ConsoleInput
            theme={theme}
            dispatchConsoleEvent={dispatchConsoleEvent}
            fontSize={fontSize}
          />
        }
      </div>
    </section>
  );
};

Console.propTypes = {
  t: PropTypes.func.isRequired,
};


export default withTranslation()(Console);
