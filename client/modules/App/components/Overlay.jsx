import PropTypes from 'prop-types';
import React from 'react';
import InlineSVG from 'react-inlinesvg';
import { browserHistory } from 'react-router';

const exitUrl = require('../../../images/exit.svg');

class Overlay extends React.Component {
  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.keyPressHandle = this.keyPressHandle.bind(this);
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false);
    document.addEventListener('keydown', this.keyPressHandle);
  }

  componentDidMount() {
    this.node.focus();
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false);
    document.removeEventListener('keydown', this.keyPressHandle);
  }

  handleClick(e) {
    if (this.node.contains(e.target)) {
      return;
    }

    this.handleClickOutside();
  }

  handleClickOutside() {
    this.close();
  }

  keyPressHandle(e) {
    // escape key code = 27.
    // So here we are checking if the key pressed was Escape key.
    if (e.keyCode === 27) {
      this.close();
    }
  }

  close() {
    if (!this.props.closeOverlay) {
      browserHistory.push(this.props.previousPath);
    } else {
      this.props.closeOverlay();
    }
  }

  render() {
    const {
      ariaLabel,
      title,
      children
    } = this.props;
    return (
      <div className="overlay">
        <div className="overlay__content">
          <section
            tabIndex="0"
            role="main"
            aria-label={ariaLabel}
            ref={(node) => { this.node = node; }}
            className="overlay__body"
          >
            <header className="overlay__header">
              <h2 className="overlay__title">{title}</h2>
              <button className="overlay__close-button" onClick={this.close} >
                <InlineSVG src={exitUrl} alt="close overlay" />
              </button>
            </header>
            {children}
          </section>
        </div>
      </div>
    );
  }
}

Overlay.propTypes = {
  children: PropTypes.element,
  closeOverlay: PropTypes.func,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  previousPath: PropTypes.string
};

Overlay.defaultProps = {
  children: null,
  title: 'Modal',
  closeOverlay: null,
  ariaLabel: 'modal',
  previousPath: '/'
};

export default Overlay;
