import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import slugify from 'slugify';

import TableWithRename from '../../../common/Table/TableWithRename';
import MenuItem from '../../../components/Dropdown/MenuItem';
import TableDropdown from '../../../components/Dropdown/TableDropdown';
import dates from '../../../utils/formatDate';
import Overlay from '../../App/components/Overlay';
import {
  changeProjectName,
  cloneProject,
  deleteProject
} from '../actions/project';
import { getProjects } from '../actions/projects';
import { DIRECTION } from '../actions/sorting';
import getSortedSketches from '../selectors/projects';
import { getAuthenticated, selectCurrentUsername } from '../selectors/users';
import AddToCollectionList from './AddToCollectionList';
import getConfig from '../../../utils/getConfig';

const ROOT_URL = getConfig('API_URL');

const formatDateCell = (date, mobile = false) =>
  dates.format(date, { showTime: !mobile });

// TODO: move to a util file and use this in share modals.
const sketchUrl = (sketch, username) => {
  if (username === 'p5') {
    return `/${username}/sketches/${slugify(sketch.name, '_')}`;
  }
  return `/${username}/sketches/${sketch.id}`;
};

const SketchDropdown = ({
  row: sketch,
  onClickRename,
  ownerUsername,
  setSketchToAddToCollection
}) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const isAuthenticated = useSelector(getAuthenticated);

  const currentUser = useSelector((state) => state.user.username);

  const userIsOwner = ownerUsername === currentUser;

  const handleSketchDownload = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = `${ROOT_URL}/projects/${sketch.id}/zip`;
    downloadLink.download = `${sketch.name}.zip`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleSketchDuplicate = () => {
    dispatch(cloneProject(sketch));
  };

  const handleSketchDelete = () => {
    if (
      window.confirm(
        t('Common.DeleteConfirmation', {
          name: sketch.name
        })
      )
    ) {
      dispatch(deleteProject(sketch.id));
    }
  };

  return (
    <TableDropdown aria-label={t('SketchList.ToggleLabelARIA')}>
      <MenuItem hideIf={!userIsOwner} onClick={onClickRename}>
        {t('SketchList.DropdownRename')}
      </MenuItem>
      <MenuItem onClick={handleSketchDownload}>
        {t('SketchList.DropdownDownload')}
      </MenuItem>
      <MenuItem hideIf={!isAuthenticated} onClick={handleSketchDuplicate}>
        {t('SketchList.DropdownDuplicate')}
      </MenuItem>
      <MenuItem
        hideIf={!isAuthenticated}
        onClick={() => {
          setSketchToAddToCollection(sketch);
        }}
      >
        {t('SketchList.DropdownAddToCollection')}
      </MenuItem>

      {/*
          <MenuItem onClick={this.handleSketchShare}>
            Share
          </MenuItem>
            */}
      <MenuItem hideIf={!userIsOwner} onClick={handleSketchDelete}>
        {t('SketchList.DropdownDelete')}
      </MenuItem>
    </TableDropdown>
  );
};

SketchDropdown.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  }).isRequired,
  ownerUsername: PropTypes.string.isRequired,
  onClickRename: PropTypes.func.isRequired,
  setSketchToAddToCollection: PropTypes.func.isRequired
};

const SketchList = ({ username, mobile }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUsername);

  const sketches = useSelector(getSortedSketches);

  // TODO: combine with AddToCollectionSketchList
  const loading = useSelector((state) => state.loading);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const showLoader = loading && !hasLoadedData;

  useEffect(() => {
    dispatch(getProjects(username)).then(() => setHasLoadedData(true));
  }, [dispatch, username]);

  const [sketchToAddToCollection, setSketchToAddToCollection] = useState(null);

  const handleRename = (newName, sketchId) => {
    const isValid = newName.trim().length !== 0;
    if (isValid) {
      dispatch(changeProjectName(sketchId, newName.trim()));
    }
  };

  return (
    <article className="sketches-table-container">
      <Helmet>
        <title>
          {username === currentUser
            ? t('SketchList.Title')
            : t('SketchList.AnothersTitle', {
                anotheruser: username
              })}
        </title>
      </Helmet>
      <TableWithRename
        items={sketches}
        isLoading={showLoader}
        columns={[
          {
            field: 'name',
            defaultOrder: DIRECTION.ASC,
            title: t('SketchList.HeaderName'),
            formatValue: (name, sketch) => (
              <Link to={sketchUrl(sketch, username)}>{name}</Link>
            )
          },
          {
            field: 'createdAt',
            defaultOrder: DIRECTION.DESC,
            title: t('SketchList.HeaderCreatedAt', {
              context: mobile ? 'mobile' : ''
            }),
            formatValue: (value) =>
              (mobile ? 'Created: ' : '') + formatDateCell(value, mobile)
          },
          {
            field: 'updatedAt',
            defaultOrder: DIRECTION.DESC,
            title: t('SketchList.HeaderUpdatedAt', {
              context: mobile ? 'mobile' : ''
            }),
            formatValue: (value) =>
              (mobile ? 'Updated: ' : '') + formatDateCell(value, mobile)
          }
        ]}
        addDropdownColumn
        initialSort={{
          field: 'createdAt',
          direction: DIRECTION.DESC
        }}
        emptyMessage={t('SketchList.NoSketches')}
        caption={t('SketchList.TableSummary')}
        // TODO: figure out how to use the StandardTable -- needs dropdown and styling
        handleRename={handleRename}
        Dropdown={SketchDropdown}
        dropdownProps={{
          setSketchToAddToCollection,
          ownerUsername: username
        }}
      />
      {sketchToAddToCollection && (
        <Overlay
          isFixedHeight
          title={t('SketchList.AddToCollectionOverlayTitle')}
          closeOverlay={() => {
            setSketchToAddToCollection(null);
          }}
        >
          <AddToCollectionList
            project={sketchToAddToCollection}
            username={username}
          />
        </Overlay>
      )}
    </article>
  );
};

SketchList.propTypes = {
  username: PropTypes.string.isRequired,
  mobile: PropTypes.bool
};

SketchList.defaultProps = {
  mobile: false
};

export default SketchList;
