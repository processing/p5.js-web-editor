import styled from 'styled-components';
import { prop } from '../theme';

const RootPage = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  color: ${prop('primaryTextColor')};
  background-color: ${prop('backgroundColor')};
`;

export default RootPage;
