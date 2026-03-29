import React, { useState } from 'react';
import Sketch from './Sketch';
import Collection from './Collection';

const SketchesView = () => {
  const [selectedSketches, setSelectedSketches] = useState([]);
  const [collections, setCollections] = useState([]);

  const handleSketchSelect = (sketch) => {
    const isSelected = selectedSketches.includes(sketch);
    if (isSelected) {
      setSelectedSketches(selectedSketches.filter((s) => s !== sketch));
    } else {
      setSelectedSketches([...selectedSketches, sketch]);
    }
  };

  const handleCollectionSelect = (collection) => {
    const isSelected = collections.includes(collection);
    if (isSelected) {
      setCollections(collections.filter((c) => c !== collection));
    } else {
      setCollections([...collections, collection]);
    }
  };

  const handleVisibilityChange = (visibility) => {
    selectedSketches.forEach((sketch) => {
      sketch.visibility = visibility;
    });
  };

  const handleAddToCollection = (collection) => {
    selectedSketches.forEach((sketch) => {
      collection.sketches.push(sketch);
    });
  };

  return (
    <div>
      {sketches.map((sketch) => (
        <Sketch
          key={sketch.id}
          sketch={sketch}
          onSelect={() => handleSketchSelect(sketch)}
          isSelected={selectedSketches.includes(sketch)}
        />
      ))}
      <button onClick={() => handleVisibilityChange(true)}>Make selected sketches visible</button>
      <button onClick={() => handleVisibilityChange(false)}>Make selected sketches invisible</button>
      {collections.map((collection) => (
        <Collection
          key={collection.id}
          collection={collection}
          onSelect={() => handleCollectionSelect(collection)}
          isSelected={collections.includes(collection)}
        />
      ))}
      <button onClick={() => handleAddToCollection(collections[0])}>Add selected sketches to collection</button>
    </div>
  );
};

export default SketchesView;