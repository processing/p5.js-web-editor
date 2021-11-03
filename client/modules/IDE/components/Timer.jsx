import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import dates from '../../../utils/formatDate';

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
    const timerClass = classNames({
      'timer__saved-time': true,
      'timer__saved-time--notOwner': !this.props.isUserOwner
    });
    return (
      <span className={timerClass}>
        {this.props.projectSavedTime !== '' ? this.showSavedTime() : null}
      </span>
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
