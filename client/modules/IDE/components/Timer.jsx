import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import styled from 'styled-components';

import { remSize, prop } from '../../../theme';
import dates from '../../../utils/formatDate';

const TimerWrapper = styled.span`
  font-size: ${remSize(12)};
  padding-right: ${remSize(30)};
  color: ${prop('Text.inactive')};
  display: ${(props) => (props.isVisible ? '' : 'none')};
`;

class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.showSavedTime = this.showSavedTime.bind(this);
  }

  componentDidMount() {
    this.interval = setInterval(() => this.forceUpdate(), 10000);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  showSavedTime() {
    const timeAgo = dates.distanceInWordsToNow(this.props.projectSavedTime);
    return this.props.t('Timer.SavedAgo', { timeAgo });
  }

  render() {
    return (
      <TimerWrapper isVisible={this.props.isUserOwner}>
        {this.props.projectSavedTime !== '' ? this.showSavedTime() : null}
      </TimerWrapper>
    );
  }
}

Timer.propTypes = {
  projectSavedTime: PropTypes.string.isRequired,
  isUserOwner: PropTypes.bool,
  t: PropTypes.func.isRequired
};

Timer.defaultProps = {
  isUserOwner: false
};

export default withTranslation()(Timer);
