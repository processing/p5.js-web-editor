import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Link } from 'react-router';

import { prop, remSize } from '../../../theme';

import EditProjectNameIcon from '../../../images/pencil.svg';

const Container = styled.div`
  margin-left: ${remSize(10)};
  padding-left: ${remSize(10)};
  height: 70%;
  display: flex;
  align-items: center;
  border-color: ${prop('inactiveTextColor')};
`;

const EditNameButton = styled(EditProjectNameIcon)`
  display: inline-block;
  vertical-align: top;
  width: ${remSize(18)};
  height: ${remSize(18)};
  & path {
    fill: ${prop('secondaryTextColor')};
  }
`;

const Name = styled.button`
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${prop('secondaryTextColor')};
  &:hover {
    color: ${prop('logoColor')};
    & ${EditNameButton} path {
      fill: ${prop('logoColor')};
    }
  }

  ${({ isEditingName }) => isEditingName && `display: none;`}
`;

const Input = styled.input`
  display: none;
  border: 0px;
  ${({ isEditingName }) => isEditingName && `display: block;`}
`;

const Owner = styled.p`
  margin-left: ${remSize(5)};
  color: ${prop('secondaryTextColor')};
`;

const ProjectName = (props) => {
  const {
    owner,
    currentUser,
    project,
    showEditProjectName,
    setProjectName,
    hideEditProjectName,
    saveProject
  } = props;

  const { t } = useTranslation();

  const [projectNameInputValue, setProjectNameInputValue] = useState(
    project.name
  );

  const projectNameInputRef = useRef(null);

  const canEditProjectName =
    (owner && owner.username && owner.username === currentUser) ||
    !owner ||
    !owner.username;

  const handleProjectNameChange = (event) => {
    setProjectNameInputValue(event.target.value);
  };

  const handleProjectNameSave = () => {
    const newProjectName = projectNameInputValue.trim();
    if (newProjectName.length === 0) {
      setProjectNameInputValue(project.name);
    } else {
      setProjectName(newProjectName);
      hideEditProjectName();
      if (project.id) {
        saveProject();
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      hideEditProjectName();
      projectNameInputRef.current.blur();
    }
  };

  return (
    <Container>
      <Name
        onClick={() => {
          if (canEditProjectName) {
            showEditProjectName();
            setTimeout(() => projectNameInputRef.current.focus(), 0);
          }
        }}
        disabled={!canEditProjectName}
        aria-label={t('Toolbar.EditSketchARIA')}
        isEditingName={project.isEditingName}
      >
        <span>{project.name}</span>
        {canEditProjectName && (
          <EditNameButton focusable="false" aria-hidden="true" />
        )}
      </Name>
      <Input
        type="text"
        maxLength="128"
        aria-label={t('Toolbar.NewSketchNameARIA')}
        value={projectNameInputValue}
        onChange={handleProjectNameChange}
        ref={projectNameInputRef}
        onBlur={handleProjectNameSave}
        onKeyPress={handleKeyPress}
        isEditingName={project.isEditingName}
      />
      {owner && (
        <Owner>
          {t('Toolbar.By')}
          <Link to={`/${owner.username}/sketches`}>{owner.username}</Link>
        </Owner>
      )}
    </Container>
  );
};

ProjectName.propTypes = {
  setProjectName: PropTypes.func.isRequired,
  currentUser: PropTypes.string,
  owner: PropTypes.shape({
    username: PropTypes.string
  }),
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    isEditingName: PropTypes.bool,
    id: PropTypes.string
  }).isRequired,
  showEditProjectName: PropTypes.func.isRequired,
  hideEditProjectName: PropTypes.func.isRequired,
  saveProject: PropTypes.func.isRequired
};

ProjectName.defaultProps = {
  owner: undefined,
  currentUser: undefined
};

export default ProjectName;
