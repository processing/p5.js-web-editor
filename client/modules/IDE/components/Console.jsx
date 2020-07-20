import React, { useEffect, useRef } from 'react';

import { bindActionCreators } from 'redux';

import { useSelector, useDispatch, useState } from 'react-redux';
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

import UpArrowIcon from '../../../images/up-arrow.svg';
import DownArrowIcon from '../../../images/down-arrow.svg';

import * as IDEActions from '../../IDE/actions/ide';
import * as ConsoleActions from '../../IDE/actions/console';

const useDidUpdate = (callback, deps) => {
  const hasMount = useRef(false);

  useEffect(() => {
    if (hasMount.current) {
      callback();
    } else {
      hasMount.current = true;
    }
  }, deps);
};

const getConsoleFeedStyle = (theme, times, fontSize) => {
  const style = {};
  const CONSOLE_FEED_LIGHT_ICONS = {
    LOG_WARN_ICON: `url(${warnLightUrl})`,
    LOG_ERROR_ICON: `url(${errorLightUrl})`,
    LOG_DEBUG_ICON: `url(${debugLightUrl})`,
    LOG_INFO_ICON: `url(${infoLightUrl})`
  };
  const CONSOLE_FEED_DARK_ICONS = {
    LOG_WARN_ICON: `url(${warnDarkUrl})`,
    LOG_ERROR_ICON: `url(${errorDarkUrl})`,
    LOG_DEBUG_ICON: `url(${debugDarkUrl})`,
    LOG_INFO_ICON: `url(${infoDarkUrl})`
  };
  const CONSOLE_FEED_CONTRAST_ICONS = {
    LOG_WARN_ICON: `url(${warnContrastUrl})`,
    LOG_ERROR_ICON: `url(${errorContrastUrl})`,
    LOG_DEBUG_ICON: `url(${debugContrastUrl})`,
    LOG_INFO_ICON: `url(${infoContrastUrl})`
  };
  const CONSOLE_FEED_SIZES = {
    TREENODE_LINE_HEIGHT: 1.2,
    BASE_FONT_SIZE: fontSize,
    ARROW_FONT_SIZE: fontSize,
    LOG_ICON_WIDTH: fontSize,
    LOG_ICON_HEIGHT: 1.45 * fontSize,
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

const Console = () => {
  const consoleEvents = useSelector(state => state.console);
  const isExpanded = useSelector(state => state.ide.consoleIsExpanded);
  const { theme, fontSize } = useSelector(state => state.preferences);

  const {
    collapseConsole, expandConsole, clearConsole, dispatchConsoleEvent
  } = bindActionCreators({ ...IDEActions, ...ConsoleActions }, useDispatch());

  useDidUpdate(() => {
    clearConsole();
    dispatchConsoleEvent(consoleEvents);
  }, [theme, fontSize]);

  const cm = useRef({});

  // // 2. FIXME: Console is not opening/closing, and I suspect it has to do with this
  useDidUpdate(() => { cm.current.scrollTop = cm.current.scrollHeight; });

  const consoleClass = classNames({
    'preview-console': true,
    'preview-console--collapsed': !isExpanded
  });

  return (
    <section className={consoleClass} >
      <header className="preview-console__header">
        <h2 className="preview-console__header-title">Console</h2>
        <div className="preview-console__header-buttons">
          <button className="preview-console__clear" onClick={clearConsole} aria-label="Clear console">
            Clear
          </button>
          <button
            className="preview-console__collapse"
            onClick={collapseConsole}
            aria-label="Close console"
          >
            <DownArrowIcon focusable="false" aria-hidden="true" />
          </button>
          <button className="preview-console__expand" onClick={expandConsole} aria-label="Open console" >
            <UpArrowIcon focusable="false" aria-hidden="true" />
          </button>
        </div>
      </header>
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
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};


export default Console;
