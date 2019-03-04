import classNames from 'classnames';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import PropTypes from 'prop-types';
import React from 'react';

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
      return 'Saved: just now';
    } else if (differenceInMilliseconds(now, this.props.projectSavedTime) < 20000) {
      return 'Saved: 15 seconds ago';
    } else if (differenceInMilliseconds(now, this.props.projectSavedTime) < 30000) {
      return 'Saved: 25 seconds ago';
    } else if (differenceInMilliseconds(now, this.props.projectSavedTime) < 46000) {
      return 'Saved: 35 seconds ago';
    }
    return `Saved: ${distanceInWordsToNow(this.props.projectSavedTime, {
      includeSeconds: true
    })} ago`;
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
  isUserOwner: PropTypes.bool
};

Timer.defaultProps = {
  isUserOwner: false
};

export default Timer;
