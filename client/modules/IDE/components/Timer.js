import React, { PropTypes } from 'react';
import moment from 'moment';

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
    if (Math.abs(moment().diff(this.props.projectSavedTime)) < 10000) {
      return 'Saved: just now';
    } else if (Math.abs(moment().diff(this.props.projectSavedTime)) < 20000) {
      return 'Saved: 15 seconds ago';
    } else if (Math.abs(moment().diff(this.props.projectSavedTime)) < 30000) {
      return 'Saved: 25 seconds ago';
    } else if (Math.abs(moment().diff(this.props.projectSavedTime)) < 46000) {
      return 'Saved: 35 seconds ago';
    }
    return `Saved: ${moment(this.props.projectSavedTime).fromNow()}`;
  }

  render() {
    return (
      <span className="timer__saved-time">
        {this.props.projectSavedTime !== '' ? this.showSavedTime() : null}
      </span>
    );
  }
}

Timer.propTypes = {
  projectSavedTime: PropTypes.string.isRequired
};

export default Timer;
