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
import { withRouter } from 'react-router-dom'
// import { addFilteredCommand, copyCell, removeFilteredCommand } from '../../actions/main/App';
// import { createBranch, deleteBranch } from '../../actions/project/Branch';
import { fetchWorkflow } from '../../actions/project/Notebook';
// import { cancelWorkflowExecution, checkModuleStatus, createtNotebookCell,
//     deleteNotebookCell, dismissCellChanges, fetchAnnotations, fetchWorkflow,
//     hideCellOutput, insertNotebookCell, replaceNotebookCell, showCellChart,
//     selectNotebookCell, showCellDataset, showCellStdout,
//     showCellTimestamps, updateNotebookCellWithUpload } from '../../actions/project/Notebook';
import { fetchProject, setBranch } from '../../actions/project/Project';
import { fetchProjects } from '../../actions/project/ProjectListing';
// import { LargeMessageButton } from '../../components/Button';
import ContentSpinner from '../../components/ContentSpinner';
import { FetchError } from '../../components/Message';
// import EditResourceNameModal from '../../components/modals/EditResourceNameModal';
// import NotebookStatusHeader from '../../components/notebook/NotebookStatusHeader';
// import Notebook from '../../components/notebook/Notebook';
import ResourcePage from '../../components/ResourcePage';
// import { CONTENT_CHART, CONTENT_DATASET, CONTENT_HIDE, CONTENT_TEXT,
//     CONTENT_TIMESTAMPS } from '../../resources/Outputs';
import { notebookPageUrl, SpreadsheetResource } from '../../util/App';
// import { branchPageUrl, isNotEmptyString, notebookPageUrl,
//     SpreadsheetResource } from '../../util/App';
// import { HATEOAS_MODULE_APPEND, HATEOAS_MODULE_INSERT,
//     HATEOAS_MODULE_REPLACE, HATEOAS_PROJECT_FILE_UPLOAD } from '../../util/HATEOAS';
import Spreadsheet from '../spreadsheet/Spreadsheet';
import '../../../css/App.css';
import '../../../css/ProjectPage.css';
import '../../../css/Chart.css';

/**
 * The notebook page displays workflows as notebooks and resources that are
 * associated with a workflow (e.g., datasets and charts).
 */
class SpreadsheetPage extends Component {
    static propTypes = {
        actionError: PropTypes.object,
        activeCell: PropTypes.string,
        branch: PropTypes.object,
        fetchError: PropTypes.object,
        isActive: PropTypes.bool.isRequired,
        isFetching: PropTypes.bool.isRequired,
        notebook: PropTypes.object,
        project: PropTypes.object,
        projectList: PropTypes.array,
        reversed: PropTypes.bool.isRequired,
        serviceApi: PropTypes.object,
        userSettings: PropTypes.object.isRequired,
        dataset: PropTypes.object
    }
    /**
     * Fetch project information when page is loaded.
     */
    constructor(props) {
        super(props);
        // Set the branch modal state
        this.state = {modalOpen: false, modalTitle: 'New branch', moduleId: null};
        // Fetch any resources that are currently null or out of sync with the
        // browser URL. It is assumed that the branch is set if the project is
        // set (i.e., either both are null or neither of them).
        const { branch, dispatch, notebook, project, projectList } = this.props;
        const projectId = this.props.match.params.project_id;
        const branchId = this.props.match.params.branch_id;
        const workflowId = this.props.match.params.workflow_id;
        if ((project == null) || (project.id !== projectId)) {
            dispatch(
                fetchProject(
                    projectId,
                    branchId,
                    (project, branch) => (fetchWorkflow(
                        project,
                        branch,
                        workflowId
            ))));
        } else if ((branch == null) || (branch.id !== branchId)) {
            dispatch(fetchWorkflow(project, project.findBranch(branchId), workflowId));
        } else if (notebook == null) {
            dispatch(fetchWorkflow(project, branch, workflowId));
        } else if (notebook.id !== workflowId) {
            dispatch(fetchWorkflow(project, branch, workflowId));
        }
        // Get project listing if not set yet
        if (projectList == null) {
            dispatch(fetchProjects());
        }
    }
    /**
     * Ensure proper back and forward behaviour. If there is a change in the
     * pathname we need to ensure that the resources that are referenced in
     * the path match those that are in the current state.
     */
    componentDidUpdate(prevProps) {
        // Check if the location path has changed. The change may either be
        // the result from an update operation (create branch, delete branch),
        // a switch between notebook versions or the result of the user using
        // the back and forward buttons in their browser.
        if (prevProps.location.pathname !== this.props.location.pathname) {
            const { dispatch, project, branch, notebook } = this.props;
            const projectId = this.props.match.params.project_id;
            const branchId = this.props.match.params.branch_id;
            const workflowId = this.props.match.params.workflow_id;
            if ((project == null) || (project.id !== projectId)) {
                dispatch(
                    fetchProject(
                        projectId,
                        branchId,
                        (project, branch) => (fetchWorkflow(
                            project,
                            branch,
                            workflowId
                ))));
            } else if ((branch == null) || (branch.id !== branchId)) {
                dispatch(
                    setBranch(
                        project,
                        branchId,
                        (project, branch) => (fetchWorkflow(project, branch, workflowId))
                ));
            } else if ((notebook == null) || (notebook.id !== workflowId)) {
                dispatch(fetchWorkflow(project, branch, workflowId));
            }
        }
    }

    /**
     * Dispatch action to load the workflow at the head of the current branch.
     */
    handleShowBranchHead = () => {
        const { branch, history, project } = this.props;
        history.push(notebookPageUrl(project.id, branch.id));
    }
   
    /**
     * The content of the notebook page depends on the type of resource that
     * is being shown.
     */
    render() {
        const {
            actionError,
            branch,
            dispatch,
            fetchError,
            isActive,
            isFetching,
            notebook,
            project,
            projectList,
            serviceApi,
            userSettings, 
            dataset
        } = this.props;
        // The main content of the page depends on the error and fetching state.
        let content = null;
        if (fetchError) {
            // There was an error while fetching the project or the workflow
            // listing.
            content = (
                <div className='page-content wide'>
                    <FetchError error={fetchError} />
                </div>
            );
        } else if ((project == null) || (branch == null) || (notebook == null) || (dataset == null) || (isFetching)) {
            // Show a spinner while the project information is being fetched.
            // There is nothing else to show yet.
            content = <ContentSpinner text='Loading Spreadsheet...' />;
        } else if (dataset != null) {
            
            // Layout has reverse button at top followed by list of notebook cells
            const pageContent = (
                <div className="spreadsheet">
                	<Spreadsheet />
                </div>
            );
            content = (
                <ResourcePage
                    actionError={actionError}
                    branch={branch}
                    content={pageContent}
                    contentCss='slim'
                    dispatch={dispatch}
                    isActive={isActive}
                    notebook={notebook}
                    project={project}
                    projectList={projectList}
                    resource={SpreadsheetResource(dataset)}
                    serviceApi={serviceApi}
                    userSettings={userSettings}
                    onShowNotebook={this.handleShowBranchHead}
                />
            );
        }
        return content;
    }
   
}


const mapStateToProps = state => {
    return {
        actionError: state.projectPage.actionError,
        activeCell: state.notebookPage.activeCell,
        branch: state.projectPage.branch,
        fetchError: state.notebookPage.fetchError,
        isActive: state.projectPage.isActive,
        isFetching: state.notebookPage.isFetching,
        notebook: state.notebookPage.notebook,
        project: state.projectPage.project,
        projectList: state.projectListing.projects,
        reversed: state.notebookPage.reversed,
        serviceApi: state.serviceApi,
        userSettings: state.app.userSettings,
        dataset: state.datasetErrorsPage.dataset
    }
}


export default withRouter(connect(mapStateToProps)(SpreadsheetPage));
