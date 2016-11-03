import React, { PropTypes } from 'react';
import moment from 'moment';

class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.showSavedTime = this.showSavedTime.bind(this);
  }

  componentWillMount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  componentDidMount() {
    this.interval = setInterval(() => this.forceUpdate(), 10000);
  }

  showSavedTime() {
    if (Math.abs(moment().diff(this.props.projectSavedTime)) < 10000) {
      return 'Saved: just now';
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
