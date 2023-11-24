import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import browserHistory from '../../../browserHistory';
import ExitIcon from '../../../images/exit.svg';
import { DocumentKeyDown } from '../../IDE/hooks/useKeyDownHandlers';

class Overlay extends React.Component {
  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false);
  }

  componentDidMount() {
    this.node.focus();
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false);
  }

  handleClick(e) {
    if (this.node.contains(e.target)) {
      return;
    }

    this.handleClickOutside(e);
  }

  handleClickOutside() {
    this.close();
  }

  close() {
    // Only close if it is the last (and therefore the topmost overlay)
    const overlays = document.getElementsByClassName('overlay');
    if (this.node.parentElement.parentElement !== overlays[overlays.length - 1])
      return;

    if (!this.props.closeOverlay) {
      browserHistory.push(this.props.previousPath);
    } else {
      this.props.closeOverlay();
    }
  }

  render() {
    const { ariaLabel, title, children, actions, isFixedHeight } = this.props;
    return (
      <div
        className={`overlay ${isFixedHeight ? 'overlay--is-fixed-height' : ''}`}
      >
        <div className="overlay__content">
          <section
            role="main"
            aria-label={ariaLabel}
            ref={(node) => {
              this.node = node;
            }}
            className="overlay__body"
          >
            <header className="overlay__header">
              <h2 className="overlay__title">{title}</h2>
              <div className="overlay__actions">
                {actions}
                <button
                  className="overlay__close-button"
                  onClick={this.close}
                  aria-label={this.props.t('Overlay.AriaLabel', { title })}
                >
                  <ExitIcon focusable="false" aria-hidden="true" />
                </button>
              </div>
            </header>
            {children}
            <DocumentKeyDown handlers={{ escape: () => this.close() }} />
          </section>
        </div>
      </div>
    );
  }
}

Overlay.propTypes = {
  children: PropTypes.element,
  actions: PropTypes.element,
  closeOverlay: PropTypes.func,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  previousPath: PropTypes.string,
  isFixedHeight: PropTypes.bool,
  t: PropTypes.func.isRequired
};

Overlay.defaultProps = {
  children: null,
  actions: null,
  title: 'Modal',
  closeOverlay: null,
  ariaLabel: 'modal',
  previousPath: '/',
  isFixedHeight: false
};

export default withTranslation()(Overlay);
