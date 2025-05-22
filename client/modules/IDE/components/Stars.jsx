import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import AsteriskIcon from '../../../images/p5-asterisk.svg';

const Stars = ({ top, left }) => {
  const stars = useMemo(() => {
    const styles = [];

    for (let i = 0; i < 20; i += 1) {
      const x = Math.round(Math.random() * 200 - 100);
      const y = Math.round(Math.random() * 200 - 100);
      const s = 3 + Math.random() * 2;
      const rotation = Math.random() * Math.PI * 2;
      const style = {
        transform: `translate(${x}px, ${y}px) scale(${s.toFixed(
          4
        )}) rotate(${rotation.toFixed(4)}rad)`
      };
      const key = i;
      styles.push({ style, key });
    }

    return styles;
  }, []);

  return (
    <div
      className="stars"
      style={{
        top,
        left
      }}
    >
      {stars.map(({ style, key }) => (
        <AsteriskIcon
          key={key}
          className="stars__star"
          style={style}
          focusable="false"
        />
      ))}
    </div>
  );
};

Stars.propTypes = {
  top: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired
};

export default Stars;
