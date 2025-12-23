import React, { useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { prop } from '../../../theme';
import { useP5Version } from '../hooks/useP5Version';
import { p5Versions } from '../../../../common/p5Versions';
import { MenuItem } from '../../../components/Dropdown/MenuItem';
import { DropdownMenu } from '../../../components/Dropdown/DropdownMenu';
import { updateFileContent } from '../actions/files';
// eslint-disable-next-line import/no-cycle
import { CmControllerContext } from '../pages/IDEView';
import { DropdownArrowIcon } from '../../../common/icons';

const VersionPickerButton = styled.div`
  display: flex;
  border: 1px solid ${prop('Modal.border')};
  background: ${prop('backgroundColor')};
`;

const VersionPickerText = styled.div`
  padding: 0.5rem 1rem;
  min-width: 8rem;
  text-align: left;
`;

const VersionPickerArrow = styled.div`
  background: ${prop('Button.primary.default.background')};
  align-self: stretch;
  width: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VersionDropdownMenu = styled(DropdownMenu)`
  & button {
    padding: 0;
  }

  margin-bottom: 0.5rem;
`;

const VersionPicker = React.forwardRef(({ onChangeVersion }, ref) => {
  const { indexID, versionInfo } = useP5Version();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const cmRef = useContext(CmControllerContext);
  const dispatchReplaceVersion = useCallback(
    (version) => {
      if (!indexID || !versionInfo) return;
      if (onChangeVersion) {
        onChangeVersion(version);
      }
      const src = versionInfo.replaceVersion(version);
      dispatch(updateFileContent(indexID, src));
      cmRef.current?.updateFileContent(indexID, src);
    },
    [indexID, versionInfo, cmRef, onChangeVersion]
  );

  if (!versionInfo) {
    return (
      <VersionPickerButton>
        <VersionPickerText>
          {t('Toolbar.CustomLibraryVersion')}
        </VersionPickerText>
        <VersionPickerArrow>
          <DropdownArrowIcon />
        </VersionPickerArrow>
      </VersionPickerButton>
    );
  }

  return (
    <VersionDropdownMenu
      className="versionPicker"
      aria-label="Select p5.js version"
      anchor={
        <VersionPickerButton ref={ref}>
          <VersionPickerText>
            {versionInfo
              ? (() => {
                  const current = p5Versions.find((v) =>
                    typeof v === 'string'
                      ? v === versionInfo.version
                      : v.version === versionInfo.version
                  );
                  if (!current) return versionInfo.version;
                  if (typeof current === 'string') return current;
                  return `${current.version} ${current.label}`;
                })()
              : t('Toolbar.CustomLibraryVersion')}
          </VersionPickerText>
          <VersionPickerArrow>
            <DropdownArrowIcon />
          </VersionPickerArrow>
        </VersionPickerButton>
      }
      align="left"
      maxHeight="50vh"
    >
      {p5Versions.map((item) => {
        const version = typeof item === 'string' ? item : item.version;
        const label =
          typeof item === 'string' ? item : `${item.version} ${item.label}`;

        return (
          <MenuItem
            key={version}
            onClick={() => dispatchReplaceVersion(version)}
          >
            {label}
          </MenuItem>
        );
      })}
    </VersionDropdownMenu>
  );
});

VersionPicker.propTypes = {
  onChangeVersion: PropTypes.func
};
VersionPicker.defaultProps = {
  onChangeVersion: undefined
};

export default VersionPicker;
