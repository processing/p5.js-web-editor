import styled from 'styled-components';
import { remSize } from '../../theme';
import RootPage from '../RootPage';

const Screen = styled(RootPage)`
  .toast {
    font-size: ${remSize(12)};
    padding: ${remSize(8)};
    border-radius: ${remSize(4)};
    width: 92%;
    top: unset;
    min-width: unset;
    bottom: ${remSize(64)};
  }
  height: 100vh;
`;

export default Screen;
