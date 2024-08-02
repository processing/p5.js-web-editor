import styled from 'styled-components';
import { prop } from '../theme';

const RootPage = styled.div`
  min-height: 100%;
  display: flex;
  justify-content: start;
  flex-direction: column;
  color: ${prop('primaryTextColor')};
  background-color: ${prop('backgroundColor')};
  height: ${({ fixedHeight }) => fixedHeight || 'initial'};

  @media (max-width: 770px) {
    height: 100%;
    overflow: hidden;
  }
  @media print {
    @page {
      page-orientation: landscape;
    }
  }
`;

export default RootPage;
