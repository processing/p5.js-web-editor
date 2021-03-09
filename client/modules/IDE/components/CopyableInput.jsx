import PropTypes from 'prop-types';
import React from 'react';
import Clipboard from 'clipboard';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';
import styled from 'styled-components';
import { remSize, prop } from '../../../theme';
import ShareIcon from '../../../images/share.svg';
import Button from '../../../common/Button';

const CopyableInputWrapper = styled.div`
  padding-bottom: ${remSize(30)};
  display: flex;
  .tooltipped::after {
    background-color: ${prop('Button.hover.background')};
    color: ${prop('Button.hover.foreground')};
    font-family: Montserrat, sans-serif;
    font-size: #{12 / $base-font-size}rem;
  }

  .tooltipped-n::before,
  .tooltipped::before {
    color: ${prop('Button.hover.background')};
    border-top-color: ${prop('Button.hover.background')};
  }
`;
const CopyableInputValueContainer = styled.div`
  width: 100%;
  /* position: relative; */
`;
const CopyableInputLabel = styled.label`
  width: 100%;
  font-size: ${remSize(12)};
  padding-bottom: ${remSize(5)};
  color: ${prop('Text.inactive')};
`;
const CopyableInputLabelValue = styled.div`
  display: flex;
  justify-content: space-between;
`;
const CopyableInputValue = styled.input`
  width: 100%;
  font-size: ${remSize(16)};
  border-radius: ${(props) => (props.hasPreviewLink ? '2px 0 0 2px' : '')};
`;
const CopyableInputPreview = styled(Button)`
  align-self: flex-end;
  border-radius: 0 2px 2px 0 !important;
  padding: ${remSize(2)} 0 !important;
  line-height: unset !important;
  & svg {
    height: ${remSize(30)};
    width: ${remSize(30)};
  }
`;

class CopyableInput extends React.Component {
  constructor(props) {
    super(props);
    this.onMouseLeaveHandler = this.onMouseLeaveHandler.bind(this);
  }

  componentDidMount() {
    this.clipboard = new Clipboard(this.input, {
      target: () => this.input
    });

    this.clipboard.on('success', (e) => {
      this.tooltip.classList.add('tooltipped');
      this.tooltip.classList.add('tooltipped-n');
    });
  }

  componentWillUnmount() {
    this.clipboard.destroy();
  }

  onMouseLeaveHandler() {
    this.tooltip.classList.remove('tooltipped');
    this.tooltip.classList.remove('tooltipped-n');
  }

  render() {
    const { label, value, hasPreviewLink } = this.props;
    const copyableInputClass = classNames({
      'copyable-input': true,
      'copyable-input--with-preview': hasPreviewLink
    });
    return (
      <CopyableInputWrapper className={copyableInputClass}>
        <CopyableInputValueContainer
          className="tooltipped-no-delay"
          aria-label={this.props.t('CopyableInput.CopiedARIA')}
          ref={(element) => {
            this.tooltip = element;
          }}
          onMouseLeave={this.onMouseLeaveHandler}
        >
          <CopyableInputLabel htmlFor={`copyable-input__value-${label}`}>
            <CopyableInputLabelValue>{label}</CopyableInputLabelValue>
            <CopyableInputValue
              type="text"
              id={`copyable-input__value-${label}`}
              value={value}
              ref={(element) => {
                this.input = element;
              }}
              readOnly
              hasPreviewLink={hasPreviewLink}
            />
          </CopyableInputLabel>
        </CopyableInputValueContainer>
        {hasPreviewLink && (
          <CopyableInputPreview
            target="_blank"
            rel="noopener noreferrer"
            href={value}
            aria-label={this.props.t('CopyableInput.CopiedARIA', { label })}
          >
            <ShareIcon focusable="false" aria-hidden="true" />
          </CopyableInputPreview>
        )}
      </CopyableInputWrapper>
    );
  }
}

CopyableInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  hasPreviewLink: PropTypes.bool,
  t: PropTypes.func.isRequired
};

CopyableInput.defaultProps = {
  hasPreviewLink: false
};

export default withTranslation()(CopyableInput);
