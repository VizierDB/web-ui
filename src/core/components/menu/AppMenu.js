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
import { Image, Menu } from 'semantic-ui-react';
import BranchMenuDropdown from './BranchMenuDropdown';
import ChartMenuDropdown from './ChartMenuDropdown';
import DatasetMenuDropdown from './DatasetMenuDropdown';
import DatasetCaveatMenuDropdown from './DatasetCaveatMenuDropdown';
// import NotebookMenuDropdown from './NotebookMenuDropdown';
import ProjectMenuDropdown from './ProjectMenuDropdown';
import DeleteResourceModal from '../modals/DeleteResourceModal';
import EditResourceNameModal from '../modals/EditResourceNameModal';
import FileUploadModal from '../modals/FileUploadModal';
import SettingsMenuDropdown from './SettingsMenuDropdown';
import { isNotEmptyString } from '../../util/App';
import '../../../css/ResourceListing.css';
import '../../../css/ProjectPage.css';

import logo from '../../../img/vizier_tiny.svg';

/**
 * Component that allows to select the current branch. In addition to switching
 * between branches the component allows to edit the branch name and to delete
 * selected branch.
 */

/*
 * Identify the different types of modals that may be displayed.
 */
const MODAL_CREATE_PROJECT = 'MODAL_CREATE_PROJECT';
const MODAL_IMPORT_PROJECT = 'MODAL_IMPORT_PROJECT';
const MODAL_DELETE_BRANCH = 'MODAL_DELETE_BRANCH';
const MODAL_DELETE_PROJECT = 'MODAL_DELETE_PROJECT';
const MODAL_EDIT_BRANCH_NAME = 'MODAL_EDIT_BRANCH_NAME';
const MODAL_EDIT_PROJECT_NAME = 'MODAL_EDIT_PROJECT_NAME';

class AppMenu extends React.Component {
    static propTypes = {
        branch: PropTypes.object,
        notebook: PropTypes.object,
        onCreateBranch: PropTypes.func,
        onCreateProject: PropTypes.func.isRequired,
        onImportProject: PropTypes.func.isRequired,
        onDeleteBranch: PropTypes.func,
        onDeleteProject: PropTypes.func.isRequired,
        onEditBranch: PropTypes.func.isRequired,
        onEditProject: PropTypes.func.isRequired,
        onCancelExec: PropTypes.func.isRequired,
        onGoHome: PropTypes.func.isRequired,
        onHideCells: PropTypes.func.isRequired,
        onReverse: PropTypes.func.isRequired,
        onSetFilter: PropTypes.func.isRequired,
        onShowChart: PropTypes.func.isRequired,
        onShowDataset: PropTypes.func.isRequired,
        onShowDatasetCaveat: PropTypes.func.isRequired,
        onShowHistory: PropTypes.func.isRequired,
        onShowNotebook: PropTypes.func,
        onShowProject: PropTypes.func.isRequired,
        onSwitchBranch: PropTypes.func,
        project: PropTypes.object,
        projectList: PropTypes.array,
        resource: PropTypes.object.isRequired,
        userSettings: PropTypes.object.isRequired
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
    handleDeleteCurrentBranch = (branch) => {
        const { onDeleteBranch } = this.props;
        onDeleteBranch(branch);
        this.hideModal();
    }
    /**
     * Hide the modal and delete the current project using the given callback
     * handler.
     */
    handleDeleteProject = () => {
        const { onDeleteProject, project } = this.props;
        this.hideModal();
        onDeleteProject(project);
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
            branch,
            notebook,
            onCreateBranch,
            onCancelExec,
            onCreateProject,
            onImportProject,
            onGoHome,
            onHideCells,
            onReverse,
            onSetFilter,
            onShowChart,
            onShowDataset,
            onShowDatasetCaveat,
            onShowHistory,
            onShowNotebook,
            onShowProject,
            onSwitchBranch,
            project,
            projectList,
            resource,
            userSettings
        } = this.props;
        // The basic layout contains a menu bar and an optional modal or error
        // message.
        // Start by generating the list of elements in the menu bar.
        let menuItems = [];
        // Show the project logo as the first element. If not on the main page
        // have the logo be clickable to get to the homepage.
        if (!resource.isMainPage()) {
            menuItems.push(
                <Menu.Item key='logo' header onClick={onGoHome}>
                    <Image src={logo}/>
                </Menu.Item>
            );
        } else {
            menuItems.push(
                <Menu.Item key='logo' header><Image src={logo} /></Menu.Item>
            );
        }
        // Show the project name if the project is set
        if (project != null) {
            menuItems.push(<Menu.Item key='name' header>{project.name}</Menu.Item>);
        }
        menuItems.push(
            <ProjectMenuDropdown
                key='project'
                onCreate={this.showCreateProjecthModal}
            	onImport={this.showImportProjecthModal}
            	onDelete={this.showDeleteProjectModal}
                onEdit={this.showEditProjectNameModal}
                onSelect={onShowProject}
                project={project}
                projectList={projectList}
            />
        );
        if (resource != null) {
            // Show the branch menu if the branch is given
            if (branch != null) {
                let isMostRecentEnabled = false;
                if (notebook != null) {
                    isMostRecentEnabled = notebook.readOnly;
                }
                menuItems.push(
                    <BranchMenuDropdown
                        key='branches'
                        branches={project.branches}
                        isMostRecent={!isMostRecentEnabled}
                        onCreateBranch={onCreateBranch}
                        onDelete={this.showDeleteBranchModal}
                        onEdit={this.showEditBranchNameModal}
                        onGetMostRecent={this.switchToBranchHead}
                        onSelect={onSwitchBranch}
                        onShowHistory={onShowHistory}
                        onCancelExec={onCancelExec}
                        resource={resource}
                        selectedBranch={branch}
                        isRunning={notebook ? notebook.workflow.isRunning() : false} 
                    />
                );
            }
            // Depending on whether the resource is a notebook or not the
            // notebook menue is changed. If the resource is not a notebook the
            // menu item is a button that allows to show the notebook. If the
            // resource is a notebook the menu is a dropdown that allows th user
            // to select properties of how the notebook is displayed.
            if (!resource.isMainPage()) {
                    menuItems.push(
                        <Menu.Item
                            key='notebook'
                            icon='file alternate outline' 
                            name='Notebook'
                            disabled={resource.isNotebook()}
                            onClick={onShowNotebook}
                        />
                    );
                
                if(notebook){
                	const modulesCount = notebook.workflow.modules.length;
	                if (modulesCount > 0 && Object.keys(notebook.workflow.datasets).length > 0) {
	                	const datasets = Array.from(new Map(notebook.workflow.modules.flatMap(function(module, index) {
	                		if(module.datasets){
	                			return module.datasets;
	                		}
	                		else {
	                			return [];
	                		}
	                	}).map(ds => [ds.name, ds])).values());
	                	menuItems.push(
		                    <DatasetMenuDropdown
		                        key='datasets'
		                        datasets={datasets}
		                        onSelect={onShowDataset}
		                        resource={resource}
		                    />
		                );
		                menuItems.push(
		                    <DatasetCaveatMenuDropdown
		                        key='errors'
		                        datasets={datasets}
		                        onSelect={onShowDatasetCaveat}
		                        resource={resource}
		                    />
		                );
	                }
	                if (notebook.workflow.charts) {
		                menuItems.push(
		                    <ChartMenuDropdown
		                        key='charts'
		                        charts={notebook.workflow.charts}
		                        onSelect={onShowChart}
		                        resource={resource}
		                    />
		                );
	                }
	            }
            }
        }
        // Menu options to modify global user settings
        menuItems.push(
            <SettingsMenuDropdown
                key='settings'
                onHideCells={onHideCells}
                onReverse={onReverse}
                onSetFilter={onSetFilter}
                userSettings={userSettings}
            />);
        let menuBar = (
            <Menu fixed='top' >
                { menuItems }
            </Menu>
        );
        // Show optional modal or error message.
        let optionalModalOrMessage = null;
        const { modal } = this.state;
        if (modal !== null) {
            if (modal === MODAL_CREATE_PROJECT) {
                optionalModalOrMessage = (<EditResourceNameModal
                    isValid={isNotEmptyString}
                    open={true}
                    prompt='Enter a name for the new project'
                    title={'Create project'}
                    onCancel={this.hideModal}
                    onSubmit={onCreateProject}
                />);
            } else if (modal === MODAL_IMPORT_PROJECT) {
                optionalModalOrMessage = (<FileUploadModal
                        open={true}
                        prompt='Select a project export file to import'
                        title={'Import project'}
                        onCancel={this.hideModal}
                        onSubmit={onImportProject}
                    />);
            } else if ((modal === MODAL_DELETE_BRANCH) && (branch != null)) {
                optionalModalOrMessage = (<DeleteResourceModal
                    open={true}
                    onCancel={this.hideModal}
                    onSubmit={this.handleDeleteCurrentBranch}
                    prompt={'Do you really want to delete the branch ' + branch.name + '?'}
                    title={'Delete branch'}
                    value={branch}
                />)
            } else if ((modal === MODAL_DELETE_PROJECT) && (project != null)) {
                optionalModalOrMessage = (<DeleteResourceModal
                    open={true}
                    onCancel={this.hideModal}
                    onSubmit={this.handleDeleteProject}
                    prompt={'Do you really want to delete the project ' + project.name + '?'}
                    title={'Delete project'}
                    value={branch}
                />)
            } else if ((modal === MODAL_EDIT_PROJECT_NAME) && (project != null)) {
                optionalModalOrMessage = (<EditResourceNameModal
                    isValid={isNotEmptyString}
                    open={true}
                    onCancel={this.hideModal}
                    onSubmit={this.submitUpdateProjectName}
                    title={'Edit project name'}
                    value={project.name}
                />)
            } else if ((modal === MODAL_EDIT_BRANCH_NAME) && (branch != null)) {
                optionalModalOrMessage = (<EditResourceNameModal
                    isValid={isNotEmptyString}
                    open={true}
                    onCancel={this.hideModal}
                    onSubmit={this.submitUpdateBranchName}
                    title={'Edit branch name'}
                    value={branch.name}
                />)
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
     * Show modal dialog to enter a new project name.
     */
    showCreateProjecthModal = () => (this.setState({modal: MODAL_CREATE_PROJECT }));
    /**
     * Show modal dialog to upload a project export.
     */
    showImportProjecthModal = () => (this.setState({modal: MODAL_IMPORT_PROJECT }));
    /**
     * Show modal dialog to confirm branch delete.
     */
    showDeleteBranchModal = () => (this.setState({modal: MODAL_DELETE_BRANCH }));
    /**
     * Show modal dialog to confirm project delete.
     */
    showDeleteProjectModal = () => (this.setState({modal: MODAL_DELETE_PROJECT }));
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
        const { onEditBranch, branch } = this.props;
        this.hideModal();
        if (name.trim() !== branch.name) {
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
     * Show workflow at branch head when user wants to return to the head - previously 'Go Live'
     */
    switchToBranchHead = () => {
        const { onShowNotebook } = this.props;
        onShowNotebook();
    }
}

export default AppMenu;
