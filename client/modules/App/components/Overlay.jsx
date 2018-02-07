import PropTypes from 'prop-types';
import React from 'react';
import InlineSVG from 'react-inlinesvg';
import { browserHistory } from 'react-router';

const exitUrl = require('../../../images/exit.svg');

class Overlay extends React.Component {
  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
  }

  componentDidMount() {
    this.overlay.focus();
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
            ref={(element) => { this.overlay = element; }}
            className="overlay__body"
          >
            <header className="overlay__header">
              <h2 className="overlay__title">{title}</h2>
              <button className="overlay__close-button" onClick={this.close}>
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
