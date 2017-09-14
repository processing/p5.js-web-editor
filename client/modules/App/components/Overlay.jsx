import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
import { browserHistory } from 'react-router';

const leftArrow = require('../../../images/left-arrow.svg');
const exitUrl = require('../../../images/exit.svg');

class Overlay extends React.Component {
  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.goBack = this.goBack.bind(this);
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

  goBack() {
    browserHistory.push(this.props.backButtonPath);
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
              <div className="overlay__navigation_buttons_container">
                {(this.props.backButtonPath !== null) ?
                  <button className="overlay__back-button" onClick={this.goBack}>
                    <InlineSVG src={leftArrow} alt="go back to previous page" />
                  </button>
                : null}
                <button className="overlay__close-button" onCli


                ck={this.close}>
                  <InlineSVG src={exitUrl} alt="close overlay" />
                </button>
              </div>
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
  previousPath: PropTypes.string,
  backButtonPath: PropTypes.string,
};

Overlay.defaultProps = {
  children: null,
  title: 'Modal',
  closeOverlay: null,
  ariaLabel: 'modal',
  backButtonPath: null,
  previousPath: '/'
};

export default Overlay;
