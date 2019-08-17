import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import classNames from 'classnames';
import InlineSVG from 'react-inlinesvg';

const exitUrl = require('../../../images/exit.svg');

const LIBRARIES = [
  {
    name: 'p5.js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/p5.js'
  },
  {
    name: 'p5.dom.js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/addons/p5.dom.min.js'
  },
  {
    name: 'p5.sound.js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/addons/p5.sound.min.js'
  },
  {
    name: 'ml5.js',
    url: 'https://unpkg.com/ml5@0.2.3/dist/ml5.min.js'
  },
  {
    name: 'tone.js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/tone/13.0.1/Tone.min.js'
  },
  {
    name: 'p5.func.js',
    url: 'https://raw.githubusercontent.com/IDMNYU/p5.js-func/master/lib/p5.func.min.js'
  },
  {
    name: 'p5.AsciiArt.js',
    url: 'https://tetoki.eu/asciiart/asciiart/p5.asciiart.min.js'
  },
  {
    name: 'p5.clickable.js',
    url: 'https://raw.githubusercontent.com/Lartu/p5.clickable/master/p5.clickable.min.js'
  },
];

// At some point this will probably be generalized to a generic modal
// in which you can insert different content
// but for now, let's just make this work
class AddLibraryModal extends React.Component {
  constructor(props) {
    super(props);
    this.focusOnModal = this.focusOnModal.bind(this);
  }

  componentDidMount() {
    this.focusOnModal();
  }

  focusOnModal() {
    this.modal.focus();
  }

  isLibraryAdded(name) {
    const existingLibraries = this.props.libraries.map(obj => obj.name);
    return existingLibraries.indexOf(name) > -1;
  }

  handleAddLibrary(name, url) {
    // Only add library if it doesn't exist.
    if (!this.isLibraryAdded(name)) {
      this.props.addLibraryRequest(name, url);
    }
  }

  render() {
    const modalClass = classNames({
      modal: true,
    });

    return (
      <section className={modalClass} ref={(element) => { this.modal = element; }}>
        <div className="modal-content">
          <div className="modal__header">
            <h2 className="modal__title">Add Library</h2>
            <button className="modal__exit-button" onClick={this.props.closeModal}>
              <InlineSVG src={exitUrl} alt="Close New File Modal" />
            </button>
          </div>
          <div className="modal__body">
            { LIBRARIES.map((library, i) => {
              const buttonClass = classNames(['add-library-button', { selected: this.isLibraryAdded(library.name) }]);
              return (
                <button className={buttonClass} key={library.name} onClick={() => { this.handleAddLibrary(library.name, library.url); }}>
                  {library.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
}

AddLibraryModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  addLibraryRequest: PropTypes.func.isRequired,
  libraries: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  })).isRequired
};

export default reduxForm({
  form: 'add-library',
  fields: ['name'],
})(AddLibraryModal);
