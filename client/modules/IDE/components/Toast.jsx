import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import InlineSVG from 'react-inlinesvg';
const exitUrl = require('../../../images/exit.svg');
import * as ToastActions from '../actions/toast';

function Toast(props) {
  return (
    <section className="toast">
      <p>
        {props.text}
      </p>
      <button className="toast__close" onClick={props.hideToast}>
        <InlineSVG src={exitUrl} alt="Close Keyboard Shortcuts Overlay" />
      </button>
    </section>
  );
}

Toast.propTypes = {
  text: PropTypes.string.isRequired,
  hideToast: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return state.toast;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ToastActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Toast);
