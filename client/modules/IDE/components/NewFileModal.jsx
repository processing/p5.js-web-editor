import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import NewFileForm from './NewFileForm';
import { closeNewFileModal } from '../actions/ide';
import ExitIcon from '../../../images/exit.svg';


// At some point this will probably be generalized to a generic modal
// in which you can insert different content
// but for now, let's just make this work
class NewFileModal extends React.Component {
  constructor(props) {
    super(props);
    this.focusOnModal = this.focusOnModal.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  componentDidMount() {
    this.focusOnModal();
    document.addEventListener('click', this.handleOutsideClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, false);
  }

  handleOutsideClick(e) {
    // ignore clicks on the component itself
    if (e.path.includes(this.modal)) return;

    this.props.closeNewFileModal();
  }

  focusOnModal() {
    this.modal.focus();
  }

  render() {
    return (
      <section className="modal" ref={(element) => { this.modal = element; }}>
        <div className="modal-content">
          <div className="modal__header">
            <h2 className="modal__title">{this.props.t('NewFileModal.Title')}</h2>
            <button
              className="modal__exit-button"
              onClick={this.props.closeNewFileModal}
              aria-label={this.props.t('NewFileModal.CloseButtonARIA')}
            >
              <ExitIcon focusable="false" aria-hidden="true" />
            </button>
          </div>
          <NewFileForm
            focusOnModal={this.focusOnModal}
          />
        </div>
      </section>
    );
  }
}

NewFileModal.propTypes = {
  closeNewFileModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ closeNewFileModal }, dispatch);
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(NewFileModal));
