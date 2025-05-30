import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { CopyIcon } from '../../../common/icons';
import { showToast } from '../actions/toast';

const TextAreaWrapper = styled.div`
  position: relative;
`;

const CornerButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
`;

export default function TextArea({ src, className }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const copyTextToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(src);
      dispatch(showToast(t('Preferences.CopyToClipboardSuccess')));
    } catch (_e) {
      dispatch(showToast(t('Preferences.CopyToClipboardFailure'), 5000));
    }
  };

  return (
    <TextAreaWrapper>
      <textarea className={className}>{src}</textarea>
      <CornerButton onClick={copyTextToClipboard}>
        <CopyIcon aria-label="Copy" />
      </CornerButton>
    </TextAreaWrapper>
  );
}

TextArea.propTypes = {
  src: PropTypes.string.isRequired,
  className: PropTypes.string
};

TextArea.defaultProps = {
  className: undefined
};
