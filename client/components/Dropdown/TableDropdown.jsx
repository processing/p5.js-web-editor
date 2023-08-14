import styled from 'styled-components';
import { prop, remSize } from '../../theme';
import DropdownMenu from './DropdownMenu';

const TableDropdown = styled(DropdownMenu).attrs({ align: 'right' })`
  & > button {
    width: ${remSize(25)};
    height: ${remSize(25)};
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
