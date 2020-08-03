import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as ToastActions from '../actions/toast';

import ExitIcon from '../../../images/exit.svg';

function Toast(props) {
  const { t } = useTranslation();
  return (
    <section className="toast">
      <p>
        {t(props.text)}
      </p>
      <button className="toast__close" onClick={props.hideToast} aria-label="Close Alert" >
        <ExitIcon focusable="false" aria-hidden="true" />
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
