import styled from 'styled-components';
import { prop, remSize } from '../../../../theme';

export const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 5.5rem;
  transform: ${(props) =>
    props.expanded ? 'translateX(50%)' : 'translateX(0)'};

  > header {
    display: flex;
    ${prop('MobilePanel.secondary')}
    > span {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: ${remSize(10)};
      font-weight: bold;
      ${prop('MobilePanel.default')}
    }
  }

  > section {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100vw;
    overflow-y: auto;
  }
`;

export const EditorHolder = styled.div`
  min-height: 100%;
`;

export const PreviewWrapper = styled.div`
  display: ${(props) => (props.show ? 'block' : 'none')};
  position: relative;
  height: 100vh;
  min-width: 100%;

  .preview-console {
    z-index: 1;
  }
`;

export const EditorSidebarWrapper = styled.div`
  display: ${(props) => (props.show ? 'flex' : 'none')};
  height: 100%;
  position: relative;
`;

export const FileDrawer = styled.div`
  height: 100%;
  width: 50vw;
  display: ${(props) => (props.show ? 'flex' : 'none')};
  flex-direction: column;
  position: absolute;
  /* z-index: 10; */
  background: ${prop('backgroundColor')};

  > button[data-backdrop='filedrawer'] {
    position: absolute;
    background-color: #0005;
    height: 100%;
    width: 100%;
    z-index: 2;
    transform: translateX(100%);
  }

  > nav {
    padding: ${remSize(14)};
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    > h4 {
      font-weight: bold;
      font-size: ${remSize(15)};
      margin: 0;
    }
    > button {
      ${prop('Button.primary.default')}
      height: ${remSize(25)};
      width: ${remSize(25)};
    }
  }
`;
