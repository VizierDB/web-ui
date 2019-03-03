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
import { fetchWorkflow } from '../../actions/project/Notebook';
import { fetchProject, setBranch } from '../../actions/project/Project';
import ContentSpinner from '../../components/ContentSpinner';
import { FetchError } from '../../components/Message';
import ProjectResourcePage from '../../components/project/ProjectResourcePage';
import { NotebookResource } from '../../resources/Project';
import { notebookPageUrl } from '../../util/App.js';

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
        branch: PropTypes.object,
        fetchError: PropTypes.object,
        groupMode: PropTypes.number,
        isActive: PropTypes.bool.isRequired,
        isFetching: PropTypes.bool.isRequired,
        project: PropTypes.object,
        serviceApi: PropTypes.object,
        workflow: PropTypes.object
    }
    /**
     * Fetch project information when page is loaded.
     */
    constructor(props) {
        super(props);
        const { dispatch, project, branch, workflow } = this.props;
        const projectId = this.props.match.params.project_id;
        const branchId = this.props.match.params.branch_id;
        const workflowId = this.props.match.params.workflow_id;
        // Fetch any resources that are currently missing. It is assumed that
        // the branch is set if the project is set.
        if (project == null) {
            dispatch(
                fetchProject(
                    projectId,
                    branchId,
                    (project, branch) => (fetchWorkflow(
                        project,
                        branch,
                        workflowId
                    ))
                )
            );
        } else if (workflow == null) {
            dispatch(fetchWorkflow(project, branch, workflowId));
        } else if (workflow.id !== workflowId) {
            dispatch(fetchWorkflow(project, branch, workflowId));
        }
    }
    /**
     * Ensure proper back and forward behaviour. It appears that when the user
     * uses the back and previous button in the browser the current state and
     * the previous state are the same but the workflow identifier in the URL
     * is different.
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        const workflow = this.props.workflow;
        const prevWorkflow = prevProps.workflow;
        if ((workflow != null) && (prevWorkflow != null)) {
            const workflowId = this.props.match.params.workflow_id;
            const prevWorkflowId = prevProps.match.params.workflow_id;
            if ((workflow.id === prevWorkflow.id) && (workflowId !== prevWorkflowId)) {
                const { branch, dispatch, project } = this.props;
                dispatch(fetchWorkflow(project, branch, workflowId));
            } else {
                const branchId = this.props.match.params.branch_id;
                const prevBranchId = prevProps.match.params.branch_id;
                if (branchId != prevBranchId) {
                    const { dispatch, project } = this.props;
                    dispatch(
                        setBranch(
                            project,
                            branchId,
                            (project, branch) => (fetchWorkflow(project, branch))
                        )
                    );
                }
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
     * Dispatch action to switch to a given branch and retrieve the workflow at
     * the head of the branch.
     */
    handleSwitchBranch = (branch) => {
        const { dispatch, history, project } = this.props;
        history.push(notebookPageUrl(project.id, branch.id));
        dispatch(
            setBranch(
                project,
                branch.id,
                (project, branch) => (fetchWorkflow(project, branch))
            )
        );
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
            groupMode,
            isActive,
            isFetching,
            project,
            serviceApi,
            workflow
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
        } else if ((project == null) || (branch == null) || (workflow == null) || (isFetching)) {
            // Show a spinner while the project information is being fetched.
            // There is nothing else to show yet.
            content = <ContentSpinner text='Loading Notebook ...' />;
        } else if (workflow != null) {
            let pageContent = (<div><p>{workflow.id}</p></div>);
            content = (
                <ProjectResourcePage
                    actionError={actionError}
                    branch={branch}
                    content={pageContent}
                    contentCss='slim'
                    dispatch={dispatch}
                    groupMode={groupMode}
                    isActive={isActive}
                    onShowNotebook={this.handleShowBranchHead}
                    onSwitchBranch={this.handleSwitchBranch}
                    project={project}
                    resource={new NotebookResource()}
                    serviceApi={serviceApi}
                    workflow={workflow}
                />
            );
        }
        return content;
    }
}

const mapStateToProps = state => {
    return {
        actionError: state.projectPage.actionError,
        branch: state.projectPage.branch,
        fetchError: state.notebookPage.fetchError,
        groupMode: state.notebookPage.groupMode,
        isActive: state.projectPage.isActive,
        isFetching: state.notebookPage.isFetching,
        project: state.projectPage.project,
        serviceApi: state.serviceApi,
        workflow: state.notebookPage.workflow
    }
}

export default connect(mapStateToProps)(NotebookPage);
