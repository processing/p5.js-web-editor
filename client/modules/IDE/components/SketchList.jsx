import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import slugify from 'slugify';

import TableBase from '../../../common/Table/TableBase';
import MenuItem from '../../../components/Dropdown/MenuItem';
import TableDropdown from '../../../components/Dropdown/TableDropdown';
import dates from '../../../utils/formatDate';
import Overlay from '../../App/components/Overlay';
import * as IdeActions from '../actions/ide';
import * as ProjectActions from '../actions/project';
import { getProjects } from '../actions/projects';
import { DIRECTION } from '../actions/sorting';
import getSortedSketches from '../selectors/projects';
import { selectCurrentUsername } from '../selectors/users';
import AddToCollectionList from './AddToCollectionList';
import getConfig from '../../../utils/getConfig';

const ROOT_URL = getConfig('API_URL');

const formatDateCell = (date, mobile = false) =>
  dates.format(date, { showTime: !mobile });

class SketchListRowBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      renameOpen: false,
      renameValue: props.sketch.name
    };
    this.renameInput = React.createRef();
  }

  openRename = () => {
    this.setState(
      {
        renameOpen: true,
        renameValue: this.props.sketch.name
      },
      () => this.renameInput.current.focus()
    );
  };

  closeRename = () => {
    this.setState({
      renameOpen: false
    });
  };

  handleRenameChange = (e) => {
    this.setState({
      renameValue: e.target.value
    });
  };

  handleRenameEnter = (e) => {
    if (e.key === 'Enter') {
      this.updateName();
      this.closeRename();
    }
  };

  handleRenameBlur = () => {
    this.updateName();
    this.closeRename();
  };

  updateName = () => {
    const isValid = this.state.renameValue.trim().length !== 0;
    if (isValid) {
      this.props.changeProjectName(
        this.props.sketch.id,
        this.state.renameValue.trim()
      );
    }
  };

  handleSketchDownload = () => {
    const { sketch } = this.props;
    const downloadLink = document.createElement('a');
    downloadLink.href = `${ROOT_URL}/projects/${sketch.id}/zip`;
    downloadLink.download = `${sketch.name}.zip`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  handleSketchDuplicate = () => {
    this.props.cloneProject(this.props.sketch);
  };

  handleSketchShare = () => {
    this.props.showShareModal(
      this.props.sketch.id,
      this.props.sketch.name,
      this.props.username
    );
  };

  handleSketchDelete = () => {
    if (
      window.confirm(
        this.props.t('Common.DeleteConfirmation', {
          name: this.props.sketch.name
        })
      )
    ) {
      this.props.deleteProject(this.props.sketch.id);
    }
  };

  renderDropdown = () => {
    const userIsOwner = this.props.user.username === this.props.username;

    return (
      <td className="sketch-list__dropdown-column">
        <TableDropdown aria-label={this.props.t('SketchList.ToggleLabelARIA')}>
          <MenuItem hideIf={!userIsOwner} onClick={this.openRename}>
            {this.props.t('SketchList.DropdownRename')}
          </MenuItem>
          <MenuItem onClick={this.handleSketchDownload}>
            {this.props.t('SketchList.DropdownDownload')}
          </MenuItem>
          <MenuItem
            hideIf={!this.props.user.authenticated}
            onClick={this.handleSketchDuplicate}
          >
            {this.props.t('SketchList.DropdownDuplicate')}
          </MenuItem>
          <MenuItem
            hideIf={!this.props.user.authenticated}
            onClick={() => {
              this.props.onAddToCollection();
            }}
          >
            {this.props.t('SketchList.DropdownAddToCollection')}
          </MenuItem>

          {/*
          <MenuItem onClick={this.handleSketchShare}>
            Share
          </MenuItem>
            */}
          <MenuItem hideIf={!userIsOwner} onClick={this.handleSketchDelete}>
            {this.props.t('SketchList.DropdownDelete')}
          </MenuItem>
        </TableDropdown>
      </td>
    );
  };

  render() {
    const { sketch, username, mobile } = this.props;
    const { renameOpen, renameValue } = this.state;
    let url = `/${username}/sketches/${sketch.id}`;
    if (username === 'p5') {
      url = `/${username}/sketches/${slugify(sketch.name, '_')}`;
    }

    const name = (
      <React.Fragment>
        <Link to={url}>{renameOpen ? '' : sketch.name}</Link>
        {renameOpen && (
          <input
            value={renameValue}
            onChange={this.handleRenameChange}
            onKeyUp={this.handleRenameEnter}
            onBlur={this.handleRenameBlur}
            onClick={(e) => e.stopPropagation()}
            ref={this.renameInput}
          />
        )}
      </React.Fragment>
    );

    return (
      <React.Fragment>
        <tr
          className="sketches-table__row"
          key={sketch.id}
          onClick={this.handleRowClick}
        >
          <th scope="row">{name}</th>
          <td>
            {mobile && 'Created: '}
            {formatDateCell(sketch.createdAt, mobile)}
          </td>
          <td>
            {mobile && 'Updated: '}
            {formatDateCell(sketch.updatedAt, mobile)}
          </td>
          {this.renderDropdown()}
        </tr>
      </React.Fragment>
    );
  }
}

SketchListRowBase.propTypes = {
  sketch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  }).isRequired,
  username: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  deleteProject: PropTypes.func.isRequired,
  showShareModal: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  changeProjectName: PropTypes.func.isRequired,
  onAddToCollection: PropTypes.func.isRequired,
  mobile: PropTypes.bool,
  t: PropTypes.func.isRequired
};

SketchListRowBase.defaultProps = {
  mobile: false
};

function mapStateToPropsSketchListRow(state) {
  return {
    user: state.user
  };
}

function mapDispatchToPropsSketchListRow(dispatch) {
  return bindActionCreators(
    Object.assign({}, ProjectActions, IdeActions),
    dispatch
  );
}

const SketchListRow = connect(
  mapStateToPropsSketchListRow,
  mapDispatchToPropsSketchListRow
)(SketchListRowBase);

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
      <TableBase
        items={sketches}
        isLoading={showLoader}
        columns={[
          {
            field: 'name',
            defaultOrder: DIRECTION.ASC,
            title: t('SketchList.HeaderName')
          },
          {
            field: 'createdAt',
            defaultOrder: DIRECTION.DESC,
            title: t('SketchList.HeaderCreatedAt', {
              context: mobile ? 'mobile' : ''
            }),
            formatValue: (value) => formatDateCell(value, mobile)
          },
          {
            field: 'updatedAt',
            defaultOrder: DIRECTION.DESC,
            title: t('SketchList.HeaderUpdatedAt', {
              context: mobile ? 'mobile' : ''
            }),
            formatValue: (value) => formatDateCell(value, mobile)
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
        renderRow={(sketch) => (
          <SketchListRow
            mobile={mobile}
            key={sketch.id}
            sketch={sketch}
            username={username}
            onAddToCollection={() => {
              setSketchToAddToCollection(sketch);
            }}
            t={t}
          />
        )}
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
