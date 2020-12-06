import styled from 'styled-components';
import { remSize } from '../../theme';

// Applies padding to top and bottom so editor content is always visible

export default styled.div`
  z-index: 0;
  margin-top: ${remSize(16)};
  .CodeMirror-sizer > * { padding-bottom: ${remSize(320)}; };
`;
