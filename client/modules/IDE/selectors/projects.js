import { createSelector } from 'reselect';

const getSketches = (state) => state.sketches;
const getSearchTerm = (state) => state.search.sketchSearchTerm;

const getFilteredSketches = createSelector(
  getSketches,
  getSearchTerm,
  (sketches, search) => {
    if (search) {
      const searchStrings = sketches.map((sketch) => {
        const smallSketch = {
          name: sketch.name
        };
        return {
          ...sketch,
          searchString: Object.values(smallSketch).join(' ').toLowerCase()
        };
      });
      return searchStrings.filter((sketch) =>
        sketch.searchString.includes(search.toLowerCase())
      );
    }
    return sketches;
  }
);

export default getFilteredSketches;
