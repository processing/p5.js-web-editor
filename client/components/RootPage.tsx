import styled from 'styled-components';
import { prop } from '../theme';

interface RootPageProps {
  fixedHeight?: string;
}

export const RootPage = styled.div<RootPageProps>`
  min-height: 100vh;
  height: ${({ fixedHeight }) => fixedHeight || '100vh'};
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  color: ${prop('primaryTextColor')};
  background-color: ${prop('backgroundColor')};

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
