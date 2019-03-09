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
import { addFilteredCommand, removeFilteredCommand } from '../../actions/main/App';
import { createBranch, deleteBranch } from '../../actions/project/Branch';
import { fetchAnnotations, fetchWorkflow, hideCellOutput, insertNotebookCell,
    showCellChart, selectNotebookCell, showCellDataset, showCellStdout,
    showCellTimestamps } from '../../actions/project/Notebook';
import { fetchProject, setBranch } from '../../actions/project/Project';
import { fetchProjects } from '../../actions/project/ProjectListing';
import { LargeMessageButton } from '../../components/Button';
import ContentSpinner from '../../components/ContentSpinner';
import { FetchError } from '../../components/Message';
import EditResourceNameModal from '../../components/modals/EditResourceNameModal';
import NotebookStatusHeader from '../../components/notebook/NotebookStatusHeader';
import Notebook from '../../components/notebook/Notebook';
import ResourcePage from '../../components/ResourcePage';
import { CONTENT_CHART, CONTENT_DATASET, CONTENT_HIDE, CONTENT_TEXT,
    CONTENT_TIMESTAMPS } from '../../resources/Notebook';
import { NotebookResource } from '../../util/App';
import { branchPageUrl, isNotEmptyString, notebookPageUrl } from '../../util/App';

import '../../../css/App.css';
import '../../../css/ProjectPage.css';
import '../../../css/Chart.css';

/**
 * The notebook page displays workflows as notebooks and resources that are
 * associated with a workflow (e.g., datasets and charts).
 */
class NotebookPage extends Component {
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
        userSettings: PropTypes.object.isRequired
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
    componentDidUpdate(prevProps, prevState, snapshot) {
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
     * Dispatch a command specification object for a command that the user
     * wants to add to the list of hidden commands.
     */
    handleAddFilteredCommand = (command) => {
        this.props.dispatch(addFilteredCommand(command));
    }
    /**
     * Create a new branch and switch to that branch on success.
     */
    handleCreateBranch = (name) => {
        const { branch, dispatch, history, notebook, project } = this.props;
        const { moduleId } = this.state;
        // The create branch method creates a new branch on the server, updates
        // the project and push the URL for the new branch onto the history
        // stack. This should trigger the component to render the head of
        // the new branch.
        dispatch(
            createBranch(project, branch, notebook.id, moduleId, name, history)
        );
        this.hideCreateBranchModal();
    }
    /**
     * Delete the given branch. Switch to the project default branch on success.
     */
    handleDeleteBranch = (branch) => {
        const { dispatch, history, project } = this.props;
        // The delete branch method will delete the branch on the server, update
        // the project and push the URL of the default branch onto the history
        // stack. This should trigger the component to render that branch.
        dispatch(deleteBranch(project, branch, notebookPageUrl, history));
    }
    /**
     * Scroll to the given positions in the given dataset that is being
     * displayed in the output area of the cell.
     */
    handleDatasetNavigate = (module, dataset, offset, limit) => {
        const { dispatch, notebook } = this.props;
        dispatch(showCellDataset(notebook, module, dataset, offset, limit));
    }
    handleFetchDatasetCellAnnotations = (module, dataset, columnId, rowId) => {
        const { dispatch, notebook } = this.props;
        dispatch(fetchAnnotations(notebook, module, dataset, columnId, rowId));
    }
    /**
     * Event handler when the user wants to insert a new cell. The cell id is
     * the identifier of the cell and the position is either before or after.
     * The cell identifier and position may be null or undefined if the notebook
     * is empty.
     */
    handleInsertCell = (cell, position) => {
        const { dispatch, notebook } = this.props;
        if (!notebook.hasNewCellAt(cell, position)) {
            dispatch(insertNotebookCell(notebook, cell, position));
        }
    }
    /**
     * Dispatch an action to load the resource that is being shown as output
     * for the notebook cell that displays the given workflow module.
     */
    handleSelectOutput = (module, resourceType, resourceName) => {
        const { dispatch, notebook, userSettings } = this.props;
        if (resourceType === CONTENT_CHART) {
            dispatch(showCellChart(notebook, module, resourceName));
        } else if (resourceType === CONTENT_DATASET) {
            dispatch(showCellDataset(
                notebook,
                module,
                notebook.getDatasetForModule(module, resourceName),
                0,
                userSettings.cellRowLimit())
            );
        } else if (resourceType === CONTENT_HIDE) {
            dispatch(hideCellOutput(notebook, module));
        } else if (resourceType === CONTENT_TEXT) {
            dispatch(showCellStdout(notebook, module));
        } else if (resourceType === CONTENT_TIMESTAMPS) {
            dispatch(showCellTimestamps(notebook, module));
        }
    }
    /**
     * Dispatch a command specification object for a command that the user
     * wants to remove from the list of hidden commands.
     */
    handleRemoveFilteredCommand = (command) => {
        this.props.dispatch(removeFilteredCommand(command));
    }
    /**
     * Dispatch action to set the given cell as the new active cell of the
     * notebook.
     */
    handleSelectActiveCell = (cell) => {
        this.props.dispatch(selectNotebookCell(cell));
    }
    /**
     * Show branch history page.
     */
    handleShowBranch = () => {
        const { branch, history, project } = this.props;
        history.push(branchPageUrl(project.id, branch.id));
    }
    /**
     * Dispatch action to load the workflow at the head of the current branch.
     */
    handleShowBranchHead = () => {
        const { branch, history, project } = this.props;
        history.push(notebookPageUrl(project.id, branch.id));
    }
    /**
     * Dispatch action to switch to a given branch and retrieve the workflow at
     * the head of the branch.
     */
    handleSwitchBranch = (branch) => {
        const { history, project } = this.props;
        history.push(notebookPageUrl(project.id, branch.id));
    }
    /**
     * Hide the create new branch modal.
     */
    hideCreateBranchModal = () => {
        this.setState({modalOpen: false, moduleId: null});
    }
    /**
     * The content of the notebook page depends on the type of resource that
     * is being shown.
     */
    render() {
        const {
            actionError,
            activeCell,
            branch,
            dispatch,
            fetchError,
            isActive,
            isFetching,
            notebook,
            project,
            projectList,
            reversed,
            serviceApi,
            userSettings
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
        } else if ((project == null) || (branch == null) || (notebook == null) || (isFetching)) {
            // Show a spinner while the project information is being fetched.
            // There is nothing else to show yet.
            content = <ContentSpinner text='Loading Notebook ...' />;
        } else if (notebook != null) {
            const { modalOpen, modalTitle } = this.state;
            // List of notebook cells
            let notebookCells =  (
                <Notebook
                    activeNotebookCell={activeCell}
                    notebook={notebook}
                    project={project}
                    reversed={reversed}
                    onAddFilteredCommand={this.handleAddFilteredCommand}
                    onChangeGrouping={this.handleChangeGrouping}
                    onCreateBranch={this.showCreateBranchModal}
                    onDatasetNavigate={this.handleDatasetNavigate}
                    onFetchAnnotations={this.handleFetchDatasetCellAnnotations}
                    onInsertCell={this.handleInsertCell}
                    onOutputSelect={this.handleSelectOutput}
                    onRemoveFilteredCommand={this.handleRemoveFilteredCommand}
                    onSelectNotebookCell={this.handleSelectActiveCell}
                    userSettings={userSettings}
                />
            );
            // Add modal form for user to enter branch name when creating a new
            // branch.
            let notebookFooter = (
                <EditResourceNameModal
                    isValid={isNotEmptyString}
                    open={modalOpen}
                    prompt='Enter a name for the new branch'
                    title={modalTitle}
                    onCancel={this.hideCreateBranchModal}
                    onSubmit={this.handleCreateBranch}
                />
            );
            if (notebook.readOnly) {
                notebookFooter = (
                    <div className='notebook-footer'>
                        <LargeMessageButton
                            message='This is a read-only notebook. Create a new branch to start editing.'
                            icon='code-fork'
                            title='Create a new branch for this notebook'
                            onClick={() => (this.showCreateBranchModal())}
                        />
                        { notebookFooter }
                    </div>
                );
            }
            // Layout has reverse button at top followed by list of notebook cells
            const pageContent = (
                <div className="notebook">
                    <NotebookStatusHeader
                        branch={branch}
                        notebook={notebook}
                        onShowHistory={this.handleShowBranch}
                        onSwitchBranch={this.handleSwitchBranch}
                        project={project}
                    />
                    { notebookCells }
                    { notebookFooter }
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
                    onCreateBranch={this.showCreateBranchModal}
                    onDeleteBranch={this.handleDeleteBranch}
                    onShowNotebook={this.handleShowBranchHead}
                    onSwitchBranch={this.handleSwitchBranch}
                    project={project}
                    projectList={projectList}
                    resource={new NotebookResource()}
                    serviceApi={serviceApi}
                    userSettings={userSettings}
                />
            );
        }
        return content;
    }
    /**
     * Show the create new branch modal. Set the modal title to indicate the
     * cell index at which the new branch is created.
     */
    showCreateBranchModal = (module) => {
        const { notebook } = this.props;
        let moduleId = null;
        let modalTitle = 'Create branch';
        if (module == null) {
            console.log('NULL');
            if (notebook.cells.length > 0) {
                // Find the last cell that has a module
                for (let i = notebook.cells.length - 1; i >= 0; i--) {
                    const cell = notebook.cells[i];
                    if (!cell.isNewCell()) {
                        console.log('FOUND IT');
                        moduleId = cell.module.id;
                        break;
                    }
                }
            }
        } else {
            for (let i = 0; i < notebook.cells.length; i++) {
                const cell = notebook.cells[i];
                let count = 0;
                if (!cell.isNewCell()) {
                    count += 1;
                    if (module.id === cell.id) {
                        if (i === 0) {
                            modalTitle = 'New branch for cell [1]';
                        } else {
                            modalTitle = 'New branch for cells [1-' + (count) + ']';
                        }
                        break;
                    }
                }
            }
            moduleId = module.id;
        }
        this.setState({modalOpen: true, modalTitle, moduleId: moduleId});
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
        userSettings: state.app.userSettings
    }
}


export default connect(mapStateToProps)(NotebookPage);
