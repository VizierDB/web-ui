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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import {  Grid, Loader, Modal } from 'semantic-ui-react';
import { showChartView } from '../actions/chart/Chart';
import { reverseOrder, setModuleFilter, toggleHideCells } from '../actions/main/App';
import { updateBranch } from '../actions/project/Branch';
import { dismissProjectActionError, updateProject } from '../actions/project/Project';
import { createProject, deleteProject, uploadProject } from '../actions/project/ProjectListing';
import { showSpreadsheet, showDatasetCaveat, repairDatasetCaveat } from '../actions/project/Spreadsheet';
import AppMenu from './menu/AppMenu';
import { ErrorMessage } from './Message';
import { baseHref, branchPageUrl, notebookPageUrl, spreadsheetPageUrl, errorListPageUrl, valueOrDefault } from '../util/App';
import { HATEOAS_PROJECTS_CREATE, HATEOAS_PROJECTS_IMPORT }  from '../util/HATEOAS';
import { isCellOutputRequest } from '../actions/project/Notebook';

class ResourcePage extends Component {
    static propTypes = {
        actionError: PropTypes.object,
        branch: PropTypes.object,
        content: PropTypes.object.isRequired,
        contentCss: PropTypes.string.isRequired,
        dispatch: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
        isActive: PropTypes.bool.isRequired,
        notebook: PropTypes.object,
        onCreateBranch: PropTypes.func,
        onDeleteBranch: PropTypes.func,
        onShowNotebook: PropTypes.func,
        onSwitchBranch: PropTypes.func,
        onCancelExec: PropTypes.func,
        project: PropTypes.object,
        projectList: PropTypes.array,
        resource: PropTypes.object.isRequired,
        serviceApi: PropTypes.object.isRequired,
        userSettings: PropTypes.object.isRequired
    }
    /**
     * Dismiss resource error message.
     */
    dismissResourceError = () => {
        const { dispatch } = this.props;
        dispatch(dismissProjectActionError(null));
    }
    handleCreateProject = (name) => {
        const { dispatch, history, serviceApi } = this.props;
        const url = serviceApi.links.get(HATEOAS_PROJECTS_CREATE);
        dispatch(createProject(url, name, history));
    }
    handleImportProject = (file) => {
        const { dispatch, history, serviceApi } = this.props;
        const url = serviceApi.links.get(HATEOAS_PROJECTS_IMPORT);
        dispatch(uploadProject(url, file, history));
    }
    /**
     * Handle the deletion of the given project and switch to the home page.
     */
    handleDeleteProject = (project) => {
        const { dispatch, history } = this.props;
        dispatch(deleteProject(project))
        history.push(baseHref)
    }
    /**
     * Switch to the main page when the user presses the home button in the
     * application menu.
     */
    handleGoHome = () => {
        this.props.history.push(baseHref);
    }
    /**
     * Set the object that contains the filtered module identifier. Expects an
     * object where the properties are package identifier and the values are
     * lists of command identifier.
     */
    handleSetFilter = (filter) => {
        this.props.dispatch(setModuleFilter(filter));
    }
    /**
     * Show branch history page.
     */
    handleShowBranch = () => {
        const { branch, history, project } = this.props;
        history.push(branchPageUrl(project.id, branch.id));
    }
    /**
     * Show given project.
     */
    handleShowProject = (project) => {
        const { history } = this.props;
        history.push(notebookPageUrl(project.id, project.defaultBranch));
    }
    /**
     * Dispatch action to toggle the value of the reversed property in the
     * user settings.
     */
    handleToggleHideCells = () => {
        const { dispatch } = this.props;
        dispatch(toggleHideCells());
    }
    /**
     * Dispatch action to toggle the value of the reversed property in the
     * user settings.
     */
    handleToggleNotebookReverse = () => {
        const { dispatch } = this.props;
        dispatch(reverseOrder());
    }
    /**
     * Load a chart view and dispaly it as the project page resource content.
     */
    loadChartView = (chart) => {
        const { dispatch } = this.props;
        dispatch(showChartView(chart));
    }
    /**
     * Switch to spreadsheet view and load the selected dataset.
     */
    loadDataset = (dataset) => {
        const { dispatch, history, notebook, branch, project } = this.props;
        notebook.datasets[dataset.id].name = dataset.name
        dispatch(showSpreadsheet(notebook.datasets[dataset.id]));  
        history.push(spreadsheetPageUrl(project.id, branch.id, dataset.id));
    }
    /**
     * Switch to error view and load the selected dataset.
     */
    loadDatasetCaveat = (dataset) => {
        const { dispatch, history, notebook, branch, project } = this.props;
        const datasetAnnoUrl = notebook.datasets[dataset.id].links.getSelf()+'/annotations';
        notebook.datasets[dataset.id].name = dataset.name
         //dispatch(fetchAnnotations(dataset));
        dispatch(showDatasetCaveat(notebook.datasets[dataset.id], datasetAnnoUrl));
        history.push(errorListPageUrl(project.id, branch.id, dataset.id));
    }
    /**
     * Switch to spreadsheet view and load the selected to the page
     * that has the source of a specific error.
     */
    loadDatasetToError = (dataset) => (reason) => {
    	const { dispatch, serviceApi } = this.props;
    	const fetch_url = serviceApi.serviceUrl + '/datasets/' + dataset.id + '?rowid='+reason.args[reason.rowidarg]
        dispatch(showSpreadsheet(dataset, fetch_url));
    }
    /**
     * Repair a specific error.
     */
    loadDatasetRepair = (dataset) => (reason, repair, acknowledge) => {
        const { dispatch, serviceApi } = this.props;
        const url = serviceApi.serviceUrl + '/datasets/' + dataset.id + '/feedback'
        dispatch(repairDatasetCaveat(dataset, url, reason, repair, acknowledge));
    }
    render() {
        const {
            actionError,
            branch,
            content,
            contentCss,
            notebook,
            onCreateBranch,
            onDeleteBranch,
            onShowNotebook,
            onSwitchBranch,
            onCancelExec,
            project,
            projectList,
            resource,
            userSettings
        } = this.props

        // Set window title to contain project name
        if (project != null) {
            document.title = 'Vizier DB - ' + valueOrDefault(project.name, 'undefined');
        } else {
            document.title = 'Vizier DB - Projects';
        }
        // A resource error may be present independently of the project
        // resource, i.e., due to resource fetch error (-> no resource) or
        // resource update error (-> we have a resource)
        let optionalError = null;
        if (actionError != null) {
            optionalError = <ErrorMessage
                title={actionError.title}
                message={actionError.message}
                onDismiss={this.dismissResourceError}
            />;
        }
        // Show a modal with a loader that overlays the full screen if
        // the page content is currently being fetched: open={isActive}
        let pageContent = (
            <div>
                <Modal dimmer={true} open={false}>
                    <Loader size='large' active={true}>Update in progress ...</Loader>
                </Modal>
                { optionalError }
                { content }
            </div>
        )
        let headerContent = null;
        let contentCssClass = '';
        const cellOutput = isCellOutputRequest();
        if(cellOutput){
        	contentCssClass = '';
        }
        else{
        	contentCssClass = contentCss;
        	headerContent = (
        		<Grid>
		            <Grid.Row>
		            <Grid.Column className='project-menu-bar'>
		            <AppMenu
		                branch={branch}
		                notebook={notebook}
		                onCreateBranch={onCreateBranch}
		                onCreateProject={this.handleCreateProject}
		            	onImportProject={this.handleImportProject}
		            	onDeleteBranch={onDeleteBranch}
		                onDeleteProject={this.handleDeleteProject}
		                onEditBranch={this.submitEditBranch}
		                onEditProject={this.submitEditProject}
		                onGoHome={this.handleGoHome}
		                onHideCells={this.handleToggleHideCells}
		                onReverse={this.handleToggleNotebookReverse}
		                onSetFilter={this.handleSetFilter}
		                onShowChart={this.loadChartView}
		                onShowDataset={this.loadDataset}
		                onShowDatasetCaveat={this.loadDatasetCaveat}
		                onShowHistory={this.handleShowBranch}
		                onShowNotebook={onShowNotebook}
		                onShowProject={this.handleShowProject}
		                onSwitchBranch={onSwitchBranch}
                        onCancelExec={onCancelExec}
		                project={project}
		                projectList={projectList}
		                resource={resource}
		                userSettings={userSettings}
		            />
		            </Grid.Column>
		        </Grid.Row>
		    </Grid>
		    );
        }
        return (
            <div>
                { headerContent }
                <div className={'page-content ' + contentCssClass}>
                    { pageContent }
                </div>
            </div>
        );
    }
    /**
     * Submit request to update the name of the current branch.
     */
    submitEditBranch = (name) => {
        const { dispatch, project, branch } = this.props;
        dispatch(updateBranch(project, branch, name));
    }
    /**
     * Submit request to update the name of the project.
     */
    submitEditProject = (name) => {
        const { dispatch, project } = this.props;
        dispatch(updateProject(project, name))
    }
}

export default withRouter(ResourcePage);
