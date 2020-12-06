import styled from 'styled-components';
import { remSize } from '../../theme';


export default styled.div`
  /* Dashboard Styles */
  z-index: 0;
  margin-top: ${props => remSize(props.slimheader ? 49 : 68)};
`;
