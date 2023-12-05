import React from 'react';
import { useMediaQuery } from 'react-responsive';
import styled from 'styled-components';
import { prop, remSize } from '../../theme';
import DropdownMenu from './DropdownMenu';

import DownFilledTriangleIcon from '../../images/down-filled-triangle.svg';
import MoreIconSvg from '../../images/more.svg';

const DotsHorizontal = styled(MoreIconSvg)`
  transform: rotate(90deg);
`;

const TableDropdownIcon = () => {
  // TODO: centralize breakpoints
  const isMobile = useMediaQuery({ maxWidth: 770 });

  return isMobile ? (
    <DotsHorizontal focusable="false" aria-hidden="true" />
  ) : (
    <DownFilledTriangleIcon focusable="false" aria-hidden="true" />
  );
};

const TableDropdown = styled(DropdownMenu).attrs({
  align: 'right',
  anchor: <TableDropdownIcon />
})`
  & > button {
    width: ${remSize(25)};
    height: ${remSize(25)};
    padding: 0;
    & svg {
      max-width: 100%;
      max-height: 100%;
    }
    & polygon,
    & path {
      fill: ${prop('inactiveTextColor')};
    }
  }
  & ul {
    top: 63%;
    right: calc(100% - 26px);
  }
`;

export default TableDropdown;
