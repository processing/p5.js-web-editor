import React from 'react';
import styled from 'styled-components';
import { remSize } from '../../theme';


export default styled.div`
  z-index: 0;
  margin-top: ${props => remSize(props.slimheader ? 50 : 68)};

  .sketch-list__sort-button { padding: 0 }

  td { font-size: ${remSize(10)} };
  th {
    font-size: ${remSize(14)};
    /* font-weight: bold; */
    max-width: ${remSize(140)}
  };
`;
