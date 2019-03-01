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
import {  Grid, Loader, Modal } from 'semantic-ui-react';
import { redirectTo } from '../../actions/main/App';
import { showChartView } from '../../actions/chart/Chart';
import {
    changeGroupMode, reverseOrder, showNotebook
} from '../../actions/notebook/Notebook';
import {
    deleteBranch, fetchBranchHistory, updateBranchName
} from '../../actions/project/Branch';
import {
    dismissProjectActionError, fetchProject, updateProjectName
} from '../../actions/project/ProjectPage';
import { showSpreadsheet, showDatasetError, repairDatasetError } from '../../actions/spreadsheet/Spreadsheet';
import { ConnectionInfo } from '../Api'
import { ErrorMessage } from '../Message';
import MainProjectMenu from './menu/MainProjectMenu';
import { pageUrl, valueOrDefault } from '../../util/App';

import '../../../css/App.css';
import '../../../css/ProjectPage.css';
import '../../../css/BranchHistory.css';
import '../../../css/Chart.css';


class ProjectResourcePage extends Component {
    static propTypes = {
        actionError: PropTypes.object,
        branch: PropTypes.object.isRequired,
        content: PropTypes.object.isRequired,
        contentCss: PropTypes.string.isRequired,
        dispatch: PropTypes.func.isRequired,
        isActive: PropTypes.bool.isRequired,
        project: PropTypes.object.isRequired,
        serviceApi: PropTypes.object.isRequired,
        workflow: PropTypes.object
    }
    /**
     * Dismiss resource error message.
     */
    dismissResourceError = () => {
        const { dispatch } = this.props;
        dispatch(dismissProjectActionError(null));
    }
    handleNotebookReverse = () => {
        const { dispatch } = this.props;
        dispatch(reverseOrder());
    }
    handleChangeGroupMode = (mode) => {
        const { dispatch } = this.props;
        dispatch(changeGroupMode(mode));
    }
    handleSelectWorkflow = (workflow) => {
        const { dispatch, project, branch, history } = this.props;
        history.push(pageUrl(project.id, branch.id, workflow.id));
        dispatch(fetchProject(project.id, branch.id, workflow.id));
    }
    /**
     * Show history for the branch of the current workflow.
     */
    loadBranchHistory = () => {
        const { dispatch, branch } = this.props;
        dispatch(fetchBranchHistory(branch));
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
        const { dispatch } = this.props;
        dispatch(showSpreadsheet(dataset));
    }
    /**
     * Switch to error view and load the selected dataset.
     */
    loadDatasetError = (dataset) => {
        const { dispatch } = this.props;
        dispatch(showDatasetError(dataset, dataset.links.self+'/annotations'));
        //dispatch(fetchAnnotations(dataset));
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
        dispatch(repairDatasetError(dataset, url, reason, repair, acknowledge));
    }
    /**
     * Switch the project resource to show the notebook for the current
     * workflow.
     */
    loadNotebook = () => {
        const { dispatch, workflow } = this.props;
        dispatch(showNotebook(workflow));
    }
    /**
     * Dispatch redirect request.
     */
    onRedirect = (url) => {
        const { dispatch } = this.props;
        dispatch(redirectTo(url));
    }
    render() {
        const {
            actionError,
            branch,
            content,
            contentCss,
            isActive,
            project,
            serviceApi,
            workflow
        } = this.props

        // Set window title to contain project name
        document.title = 'Vizier DB - ' + valueOrDefault(project.name, 'undefined');
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
        // the page content is currently being fetched.
        let pageContent = (
            <div>
                <Modal dimmer={true} open={isActive}>
                    <Loader size='large' active={true}>Update in progress ...</Loader>
                </Modal>
                { optionalError }
                { content }
            </div>
        )
        return (
            <div>
                <Grid>
                    <Grid.Row>
                        <Grid.Column className='project-menu-bar'>
                        <MainProjectMenu
                            branch={branch}
                            onChangeGrouping={this.handleChangeGroupMode}
                            onDeleteBranch={this.submitDeleteBranch}
                            onEditBranch={this.submitEditBranch}
                            onEditProject={this.submitEditProject}
                            onRedirect={this.onRedirect}
                            onReverse={this.handleNotebookReverse}
                            onShowChart={this.loadChartView}
                            onShowDataset={this.loadDataset}
                            onShowDatasetError={this.loadDatasetError}
                            onShowHistory={this.loadBranchHistory}
                            onShowNotebook={this.loadNotebook}
                            project={project}
                            workflow={workflow}
                        />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <div className={'page-content ' + contentCss}>
                    { pageContent }
                    <ConnectionInfo api={serviceApi}/>
                </div>
            </div>
        );
    }
    /**
     * Submit request to delete the given branch from the current project.
     */
    submitDeleteBranch = (branch) => {
        const { dispatch, project } = this.props;
        dispatch(deleteBranch(project, branch));
    }
    /**
     * Submit request to update the name of the current branch.
     */
    submitEditBranch = (name) => {
        const { dispatch, project, branch } = this.props;
        dispatch(updateBranchName(project, branch, name));
    }
    /**
     * Submit request to update the name of the project.
     */
    submitEditProject = (name) => {
        const { dispatch, project } = this.props;
        dispatch(updateProjectName(project, name))
    }
}

export default ProjectResourcePage;
