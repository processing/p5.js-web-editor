import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { remSize, toastColors, prop } from '../../../theme';
import * as ToastActions from '../actions/toast';

import ExitIcon from '../../../images/exit.svg';

const ToastWrapper = styled.section`
  background-color: ${toastColors.background};
  color: ${toastColors.text};
  padding: ${remSize(10)};
  position: fixed;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  min-width: ${remSize(375)}; //500px
  font-size: ${remSize(20)};
  display: flex;
  z-index: 9999;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 6px 6px 0 rgba(0, 0, 0, 0.1);
`;

const ToastCloseButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: ${remSize(40)};
  color: ${toastColors.text};
  & g,
  & path {
    fill: ${toastColors.text};
  }
  &:hover {
    color: ${prop('Toast.iconHover')};
    & g,
    & path {
      opacity: 1;
      fill: ${prop('Toast.iconHover')};
    }
  }
`;

function Toast(props) {
  const { t } = useTranslation();
  return (
    <ToastWrapper>
      <p>{t(props.text)}</p>
      <ToastCloseButton
        className="toast__close"
        onClick={props.hideToast}
        aria-label="Close Alert"
      >
        <ExitIcon focusable="false" aria-hidden="true" />
      </ToastCloseButton>
    </ToastWrapper>
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
