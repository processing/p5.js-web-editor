import PropTypes from 'prop-types';
import React,{useState,useEffect,useCallback} from 'react';
import { throttle } from 'lodash';
import { withTranslation } from 'react-i18next';
import i18next from 'i18next';
import SearchIcon from '../../../../images/magnifyingglass.svg';

const Searchbar=({
searchTerm,
setSearchTerm,
resetSearchTerm,
searchLabel=i18next.t('Searchbar.SearchSketch'),
t
}) => {

const [searchValue,setSearchValue]=useState(searchTerm);

const throttledSearchChange = useCallback(
throttle((value)=> setSearchTerm(value),500),
[setSearchTerm]
);

useEffect (()=>
{
return () =>
{
resetSearchTerm();
};
},[resetSearchTerm]);

const handleResetSearch =()=>
{
setSearchValue();
resetSearchTerm();
};

const handleSearchChange=(e)=>
{
const value=e;
setSearchValue(value);
throttledSearchChange(value.trim());
};
﻿
return ( 
<div
className={searchbar ${ 
searchValue === ' '? 'searchbar--is-empty': ''
} } 
>
<div className="searchbar__button">
<SearchIcon
className="searchbar__ icon"
focusable="false"
aria-hidden="true"
﻿
/>
</div>
<input
className="searchbar__input"
type="text"
value={searchValue}
placeholder={searchLabel}
onChange={handleSearchChange}
/>
<button
className="searchbar__clear-button"
onClick={handleResetSearch}
>
   {t(Searchbar.ClearTerm')}
</button>
</div>
);
};
﻿
Searchbar.propTypes = {
searchTerm: PropTypes.string.isRequired,
setSearchTerm:
PropTypes.func.isRequired,
resetSearchTerm: PropTypes.func.isRequired,
searchLabel: PropTypes.string,
t: PropTypes.func.isRequired
};

export default withTranslation()(Searchbar);
