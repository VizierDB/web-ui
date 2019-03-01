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
import { connect } from 'react-redux';
import {  Grid, Loader, Modal } from 'semantic-ui-react';
import queryString from 'query-string';
import { redirectTo } from '../../actions/main/App';
import { showChartView } from '../../actions/chart/Chart';
import {
    changeGroupMode, reverseOrder, showNotebook
} from '../../actions/notebook/Notebook';
import {
    deleteBranch, showBranchHistory, updateBranchName
} from '../../actions/project/Branch';
import {
    dismissProjectActionError, fetchProject, updateProjectName
} from '../../actions/project/ProjectPage';
import { showSpreadsheet, showDatasetError, repairDatasetError } from '../../actions/spreadsheet/Spreadsheet';
import { ConnectionInfo } from '../../components/Api'
import ContentSpinner from '../../components/ContentSpinner';
import { ErrorMessage, NotFoundMessage } from '../../components/Message';
import BranchHistory from '../../components/project/BranchHistory';
import DatasetError from '../../components/project/DatasetError';
import DatasetChart from '../../components/plot/DatasetChart';
import ModuleError from '../../components/project/ModuleError';
import MainProjectMenu from '../../components/project/menu/MainProjectMenu';
import ProjectStatusHeader from '../../components/project/ProjectStatusHeader';
import Notebook from '../notebook/Notebook';
import Spreadsheet from '../spreadsheet/Spreadsheet';
import { valueOrDefault } from '../../util/App';
import '../../../css/App.css';
import '../../../css/ProjectPage.css';
import '../../../css/BranchHistory.css';
import '../../../css/Chart.css';


/**
 * The project page is one of the main point of interaction for the app. The
 * page displays different workflow versions of a curation projects. For a
 * workflow version different resources (i.e., notebook, dataset or chart)
 * can be displayed. In addition, the project barnches and branch history can
 * be shown.
 *
 * The page layout has two main parts:
 *
 * <MainProjectMenu />
 * { pageContent }
 *
 * The pageContent is either of the following:
 *
 * <BranchHistory />
 * <Notebook />
 * <Spreadsheet />
 * <DatasetChart />
 *
 * The part of the global state that controlls the project page and its
 * resources is as follows (only part are shown):
 *
 * - project (ProjectHandle)
 *   - id (string)
 *   - name (string)
 *   - links (obj)
 *   - environment
 *     - modules
 *     - files
 *   - branches (list[BranchDescriptor])
 * - workflow (WorkflowHandle)
 *   - version (int)
 *   - createdAt (string)
 *   - branch (BranchDescriptor)
 *   - datasets (list[DatasetDescriptor])
 *   - charts (list[ChartDescriptor])
 *   - links (obj)
 * - resource (WorkflowResourceHandle)
 *   - name (string) // optional
 *   - content (obj)
 */
class ProjectPage extends Component {
    static propTypes = {
        actionError: PropTypes.object,
        fetchError: PropTypes.object,
        groupMode: PropTypes.number,
        isActive: PropTypes.bool.isRequired,
        isFetching: PropTypes.bool.isRequired,
        project: PropTypes.object,
        resource: PropTypes.object,
        serviceApi: PropTypes.object,
        workflow: PropTypes.object
    }
    /**
     * Fetch project information when page is loaded.
     */
    constructor(props) {
        super(props);
        const { dispatch, location } = this.props
        const projectId = this.props.match.params.project_id
        const { branch, version } = queryString.parse(location.search)
        dispatch(fetchProject(projectId, branch, version))
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
    /**
     * Show history for the branch of the current workflow.
     */
    loadBranchHistory = () => {
        const { dispatch, workflow } = this.props;
        dispatch(showBranchHistory(workflow.branch));
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
            fetchError,
            groupMode,
            isFetching,
            project,
            serviceApi,
            workflow
        } = this.props
        let content = null;
        if (isFetching) {
            // Show a spinner while the project information is being fetched.
            // There is nothing else to show yet.
            content = <ContentSpinner text='Loading Project ...' />;
        } else if (fetchError) {
            // There was an error while fetching the project resource. Show
            // different type of message depending on whether the requested
            // project wasn't found or or a different error occured.
            if (fetchError.is404()) {
                content = (
                    <div className='not-found'>
                        <NotFoundMessage message={fetchError.message} />
                    </div>
                )
            } else {
                content = (<ErrorMessage
                    title={fetchError.title}
                    message={fetchError.message}
                />)
            }
            content = (<div className='page-content wide'>{content}</div>);
        } else if (project != null) {
            // The project has been fetched successfully.  Set window title to
            // contain project name
            document.title = 'Vizier DB - ' + valueOrDefault(project.name, 'undefined');
            // Rest of the page depends on whether a project resource is ready
            // to be show or not. We set the pageContent accordingly.
            let pageContent = null;
            const { actionError, isActive, resource } = this.props;
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
            if (resource != null) {
                // The resource has been fetched. Depending on the resource type
                // we either show a notebook, the branch history, a spreadsheet,
                // or a chart view.
                let contentCss = 'page-content';
                if (resource.isChart()) {
                    const dataset = resource.content.dataset;
                    pageContent = (
                        <div className='chart-view'>
                            <div className='dataset-chart'>
                                <h1 className='chart-name'>{resource.content.name}</h1>
                                <DatasetChart
                                    identifier={dataset.name + '_' + workflow.version}
                                    dataset={dataset}
                                />
                            </div>
                        </div>
                    );
                    contentCss += ' wide';
                } else if (resource.isDataset()) {
                    pageContent = <Spreadsheet />;
                    contentCss += ' wide';
                } else if (resource.isDatasetError()) {
                	const dataset = resource.content.dataset;
                	const annotations = resource.content.annotations;
                	pageContent = (
                            <div className='dataset-error-view'>
                                <DatasetError
                                    dataset={dataset}
                                    annotations={annotations}
                                	onGotoError={this.loadDatasetToError}
                                	onRepairError={this.loadDatasetRepair}
                                />
                            </div>
                        )
                    contentCss += ' wide';
                } else if (resource.isHistory()) {
                    pageContent = (
                        <div className='history-view'>
                            <BranchHistory
                                project={project}
                                branch={workflow.branch}
                                workflows={resource.content}
                            />
                        </div>
                    )
                    contentCss += ' slim';
                } else if (resource.isError()) {
                    const { title, module } = resource.content;
                    pageContent = <ModuleError title={title} module={module}/>;
                    contentCss += ' slim';
                } else if (resource.isNotebook()) {
                    pageContent = <Notebook />;
                    contentCss += ' slim';
                }
                // Show a modal with a loader that overlays the full screen if
                // the page content is currently being fetched.
                pageContent = (
                    <div className={contentCss}>
                        <Modal dimmer={true} open={isActive}>
                            <Loader size='large' active={true}>Loading</Loader>
                        </Modal>
                        { optionalError }
                        { pageContent }
                        <ConnectionInfo api={serviceApi}/>
                    </div>
                )
            }
            // The status header can only be displayed when the workflow is
            // loaded
            let statusHeader = null;
            if (workflow != null) {
                statusHeader = (
                    <ProjectStatusHeader
                        project={project}
                        workflow={workflow}
                    />
                );
            }
            content = (
                <div>
                    <Grid columns={2}>
                        <Grid.Row>
                            <Grid.Column className='project-menu-bar' width={10}>
                            <MainProjectMenu
                                groupMode={groupMode}
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
                                resource={resource}
                                workflow={workflow}
                            />
                            </Grid.Column>
                            <Grid.Column className='project-menu-bar' width={6}>
                            { statusHeader }
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                    { pageContent }
                </div>
            )
        }
        return content;
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
        const { dispatch, project, workflow } = this.props;
        dispatch(updateBranchName(project, workflow, name));
    }
    /**
     * Submit request to update the name of the project.
     */
    submitEditProject = (name) => {
        const { dispatch, project } = this.props;
        dispatch(updateProjectName(project, name))
    }
}


const mapStateToProps = state => {
    return {
        actionError: state.projectPage.actionError,
        fetchError: state.projectPage.fetchError,
        groupMode: state.notebook.groupMode,
        isActive: state.projectPage.isActive,
        isFetching: state.projectPage.isFetching,
        project: state.projectPage.project,
        resource: state.projectPage.resource,
        serviceApi: state.serviceApi,
        workflow: state.projectPage.workflow
    }
}

export default connect(mapStateToProps)(ProjectPage)
