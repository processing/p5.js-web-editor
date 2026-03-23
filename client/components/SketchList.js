import React from 'react';
import Tooltip from '../Tooltip';

const SketchList = () => {
  return (
    <div>
      {sketches.map((sketch) => (
        <div key={sketch.id}>
          <button
            type='button'
            aria-label='Remove from Collection'
            onClick={() => handleRemoveFromCollection(sketch.id)}
          >
            <Tooltip text='Remove from Collection' />
            <span>X</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default SketchList;