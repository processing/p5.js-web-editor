import React, { useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { Console as ConsoleFeed } from 'console-feed';
import ConsoleInput from './ConsoleInput';

import UpArrowIcon from '../../../images/up-arrow.svg';
import DownArrowIcon from '../../../images/down-arrow.svg';

import * as IDEActions from '../actions/ide';
import * as ConsoleActions from '../actions/console';
import { useDidUpdate } from '../hooks/custom-hooks';
import useHandleMessageEvent from '../hooks/useHandleMessageEvent';
import { listen } from '../../../utils/dispatcher';
import getConsoleFeedStyle from '../utils/consoleStyles';

const Console = () => {
  const { t } = useTranslation();
  const consoleEvents = useSelector((state) => state.console);
  const isExpanded = useSelector((state) => state.ide.consoleIsExpanded);
  const isPlaying = useSelector((state) => state.ide.isPlaying);
  const { theme, fontSize } = useSelector((state) => state.preferences);
  const dispatch = useDispatch();

  const cm = useRef({});

  useDidUpdate(() => {
    cm.current.scrollTop = cm.current.scrollHeight;
  });

  const consoleFeedStyle = useMemo(() => getConsoleFeedStyle(theme, fontSize), [
    theme,
    fontSize
  ]);

  const handleMessageEvent = useHandleMessageEvent();

  useEffect(() => {
    const unsubscribe = listen(handleMessageEvent);
    return function cleanup() {
      unsubscribe();
    };
  });

  const handleClearConsole = () => dispatch(ConsoleActions.clearConsole());
  const handleCollapseConsole = () => dispatch(IDEActions.collapseConsole());
  const handleExpandConsole = () => dispatch(IDEActions.expandConsole());

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
            onClick={handleClearConsole}
            aria-label={t('Console.ClearARIA')}
          >
            {t('Console.Clear')}
          </button>
          <button
            className="preview-console__collapse"
            onClick={handleCollapseConsole}
            aria-label={t('Console.CloseARIA')}
          >
            <DownArrowIcon focusable="false" aria-hidden="true" />
          </button>
          <button
            className="preview-console__expand"
            onClick={handleExpandConsole}
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
            styles={consoleFeedStyle}
            logs={consoleEvents}
            key={`${theme}-${fontSize}`}
          />
        </div>
        {isExpanded && isPlaying && (
          <ConsoleInput theme={theme} fontSize={fontSize} />
        )}
      </div>
    </section>
  );
};

export default Console;
