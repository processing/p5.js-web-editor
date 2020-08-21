import classNames from 'classnames';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

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
    const now = new Date();
    if (Math.abs(differenceInMilliseconds(now, this.props.projectSavedTime) < 10000)) {
      return this.props.t('Timer.SavedJustNow');
    } else if (differenceInMilliseconds(now, this.props.projectSavedTime) < 20000) {
      return this.props.t('Timer.Saved15Seconds');
    } else if (differenceInMilliseconds(now, this.props.projectSavedTime) < 30000) {
      return this.props.t('Timer.Saved25Seconds');
    } else if (differenceInMilliseconds(now, this.props.projectSavedTime) < 46000) {
      return this.props.t('Timer.Saved35Seconds');
    }

    const timeAgo = distanceInWordsToNow(this.props.projectSavedTime, {
      includeSeconds: true
    });
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
