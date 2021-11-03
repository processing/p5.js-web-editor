import styled from 'styled-components';
import { prop } from '../theme';

const RootPage = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  color: ${prop('primaryTextColor')};
  background-color: ${prop('backgroundColor')};
  height: ${({ fixedHeight }) => fixedHeight || 'initial'};
`;

export default RootPage;
