import styled from 'styled-components';

import { prop, } from '../../theme';

export default styled.div`
  display: flex;
  justify-content: space-between;
  
  h3 { text-align: center; width: 100%; }
  border-top: 1px solid ${prop('Separator')};

  background: ${props => prop('backgroundColor')};
`;

