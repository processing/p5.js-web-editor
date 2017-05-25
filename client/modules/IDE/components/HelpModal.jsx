import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';

const exitUrl = require('../../../images/exit.svg');

const helpContent = {
  serveSecure: {
    title: 'Serve over HTTPS',
    body: (
      <div>
        <p>Use the checkbox to choose whether this sketch should be loaded using HTTPS or HTTP.</p>
        <p>You should choose HTTPS if you need to:</p>
        <ul>
          <li>access a webcam or microphone</li>
          <li>access an API served over HTTPS</li>
        </ul>
        <p>Choose HTTP if you need to:</p>
        <ul>
          <li>access an API served over HTTP</li>
        </ul>
      </div>
    )
  }
};

const fallbackContent = {
  title: 'No content for this topic',
  body: null,
};

class HelpModal extends React.Component {
  componentDidMount() {
    this.shareModal.focus();
  }
  render() {
    const content = helpContent[this.props.type] == null ?
      fallbackContent :
      helpContent[this.props.type];

    return (
      <section className="help-modal" ref={(element) => { this.shareModal = element; }} tabIndex="0">
        <header className="help-modal__header">
          <h2>{content.title}</h2>
          <button className="about__exit-button" onClick={this.props.closeModal}>
            <InlineSVG src={exitUrl} alt="Close Help Overlay" />
          </button>
        </header>
        <div className="help-modal__section">
          {content.body}
        </div>
      </section>
    );
  }
}

HelpModal.propTypes = {
  type: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default HelpModal;
