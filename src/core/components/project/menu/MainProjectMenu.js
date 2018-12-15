/**
 * Copyright (C) 2018 New York University
 *                    University at Buffalo,
 *                    Illinois Institute of Technology.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Menu } from 'semantic-ui-react';
import BranchMenuDropdown from './BranchMenuDropdown';
import ChartMenuDropdown from './ChartMenuDropdown';
import DatasetMenuDropdown from './DatasetMenuDropdown';
import DatasetErrorMenuDropdown from './DatasetErrorMenuDropdown';
import NotebookMenuDropdown from './NotebookMenuDropdown';
import ProjectMenuDropdown from './ProjectMenuDropdown';
import DeleteResourceModal from '../../modals/DeleteResourceModal';
import EditResourceNameModal from '../../modals/EditResourceNameModal';
import { isNotEmptyString, pageUrl } from '../../../util/App';
import '../../../../css/ResourceListing.css';
import '../../../../css/ProjectPage.css';

/**
 * Component that allows to select the current branch. In addition to switching
 * between branches the component allows to edit the branch name and to delete
 * selected branch.
 */

/*
 * Identify the different types of modals that may be displayed.
 */

const MODAL_DELETE_BRANCH = 'MODAL_DELETE_BRANCH';
const MODAL_EDIT_BRANCH_NAME = 'MODAL_EDIT_BRANCH_NAME';
const MODAL_EDIT_PROJECT_NAME = 'MODAL_EDIT_PROJECT_NAME';

class MainProjectMenu extends React.Component {
    static propTypes = {
        groupMode: PropTypes.number.isRequired,
        project: PropTypes.object.isRequired,
        resource: PropTypes.object,
        workflow: PropTypes.object.isRequired,
        onChangeGrouping: PropTypes.func.isRequired,
        onDeleteBranch: PropTypes.func.isRequired,
        onEditBranch: PropTypes.func.isRequired,
        onEditProject: PropTypes.func.isRequired,
        onRedirect: PropTypes.func.isRequired,
        onReverse: PropTypes.func.isRequired,
        onShowChart: PropTypes.func.isRequired,
        onShowDataset: PropTypes.func.isRequired,
        onShowHistory: PropTypes.func.isRequired,
        onShowNotebook: PropTypes.func.isRequired,
    }
    /**
     * Initialize internal state to keep track of any modal that may be shown.
     */
    constructor(props) {
        super(props);
        // No modal shown initially
        this.state = {modal: null};
    }
    /**
     * Submit request to delete the current branch.
     */
    deleteCurrentBranch = (branch) => {
        const { onDeleteBranch } = this.props;
        onDeleteBranch(branch);
    }
    /**
     * Hide any open modal.
     */
    hideModal = () => (this.setState({modal: null}));
    /**
     * Depending on the edit flag either show the name or the edit name form.
     */
    render() {
        const {
            groupMode,
            project,
            resource,
            workflow,
            onChangeGrouping,
            onReverse,
            onShowChart,
            onShowDataset,
            onShowDatasetError,
            onShowHistory,
            onShowNotebook
        } = this.props;
        // The basic layout contains a menu bar and an optional modal or error
        // message.
        // Start by generating the list of elements in the menu bar.
        let menuItems = [
            <Menu.Item
                header
                key='title'
            >
                <Icon name='database' />
                <span className='project-name'>{project.name}</span>
            </Menu.Item>
        ];
        menuItems.push(
            <ProjectMenuDropdown
                key='project'
                onEdit={this.showEditProjectNameModal}
            />
        );
        if (resource != null) {
            menuItems.push(
                <BranchMenuDropdown
                    key='branches'
                    branches={project.branches}
                    onDelete={this.showDeleteBranchModal}
                    onEdit={this.showEditBranchNameModal}
                    onGoLive={this.switchToBranchHead}
                    onSelect={this.switchBranch}
                    onShowHistory={onShowHistory}
                    isLive={(!workflow.readOnly) && (!resource.isHistory())}
                    selectedBranch={workflow.branch}
                />
            );
            // Depending on whether the resource is a notebook or not the
            // notebook menue is changed. If the resource is not a notebook the
            // menu item is a button that allows to show the notebook. If the
            // resource is a notebook the menu is a dropdown that allows th user
            // to select properties of how the notebook is displayed.
            if (!resource.isNotebook()) {
                menuItems.push(
                    <Menu.Item
                        key='notebook'
                        icon='file alternate outline'
                        name='Notebook'
                        onClick={onShowNotebook}
                    />
                );
            } else {
                menuItems.push(
                    <NotebookMenuDropdown
                        key='notebook'
                        groupMode={groupMode}
                        onChangeGrouping={onChangeGrouping}
                        onReverse={onReverse}
                    />);
            }
            menuItems.push(
                <DatasetMenuDropdown
                    key='datasets'
                    datasets={workflow.datasets}
                    onSelect={onShowDataset}
                    resource={resource}
                />);
            menuItems.push(
                <DatasetErrorMenuDropdown
                    key='datasets'
                    datasets={workflow.datasets}
                    onSelect={onShowDatasetError}
                    resource={resource}
                />);    
            menuItems.push(
                <ChartMenuDropdown
                    key='charts'
                    charts={workflow.charts}
                    onSelect={onShowChart}
                    resource={resource}
                />);
        }
        let menuBar = (
            <Menu secondary>
                { menuItems }
            </Menu>
        );
        // Show optional modal or error message.
        let optionalModalOrMessage = null;
        const { modal } = this.state;
        if (modal !== null) {
            if ((modal === MODAL_DELETE_BRANCH) && (resource != null)) {
                optionalModalOrMessage = <DeleteResourceModal
                    open={true}
                    onCancel={this.hideModal}
                    onSubmit={this.deleteCurrentBranch}
                    prompt={'Do you really want to delete the branch ' + workflow.branch.name + '?'}
                    title={'Delete branch'}
                    value={workflow.branch}
                />
            } else if (modal === MODAL_EDIT_PROJECT_NAME) {
                optionalModalOrMessage = <EditResourceNameModal
                    isValid={isNotEmptyString}
                    open={true}
                    onCancel={this.hideModal}
                    onSubmit={this.submitUpdateProjectName}
                    title={'Edit project name'}
                    value={project.name}
                />
            } else if ((modal === MODAL_EDIT_BRANCH_NAME) && (resource != null)) {
                optionalModalOrMessage = <EditResourceNameModal
                    isValid={isNotEmptyString}
                    open={true}
                    onCancel={this.hideModal}
                    onSubmit={this.submitUpdateBranchName}
                    title={'Edit branch name'}
                    value={workflow.branch.name}
                />
            }
        }
        return (
            <div className='project-menu'>
                { menuBar }
                { optionalModalOrMessage }
            </div>
        );
    }
    /**
     * Show modal dialog to confirm branch delete.
     */
    showDeleteBranchModal = () => (this.setState({modal: MODAL_DELETE_BRANCH }));
    /**
     * Show modal to edit the current branch name.
     */
    showEditBranchNameModal = () => (this.setState({modal: MODAL_EDIT_BRANCH_NAME }));
    /**
     * Show modal to edit the project name.
     */
    showEditProjectNameModal = () => (this.setState({modal: MODAL_EDIT_PROJECT_NAME }));
    /**
     * Submit change to current branch name.
     */
    submitUpdateBranchName = (name) => {
        const { onEditBranch, workflow } = this.props;
        this.hideModal();
        if (name.trim() !== workflow.branch.name) {
            onEditBranch(name);
        }
    }
    /**
     * Submit change to project name.
     */
    submitUpdateProjectName = (name) => {
        const { onEditProject, project } = this.props;
        this.hideModal();
        if (name.trim() !== project.name) {
            onEditProject(name);
        }
    }
    /**
     * Submit redirect request when switching branches.
     */
    switchBranch = (branch) => {
        const { onRedirect, project } = this.props;
        onRedirect(pageUrl(project.id, branch.id));
    }
    /**
     * Show workflow at branch head when user wants to 'Go Live'
     */
    switchToBranchHead = () => {
        const { onRedirect, onShowNotebook, project, workflow } = this.props;
        // If the resource workflow is read-only we need to load the branch
        // head. This is because read-only indicates that a workflow version
        // other than the branch head is currently show. If the workflow is
        // not read-only we are at the correct workflow version already. In
        // this case we simply switch to the notebook view.
        // Note that the semantics of read-only may change in the future and
        // we might need to adjust the code here.
        if (workflow.readOnly) {
            onRedirect(pageUrl(project.id, workflow.branch.id));
        } else {
            onShowNotebook();
        }
    }
}

export default MainProjectMenu;
