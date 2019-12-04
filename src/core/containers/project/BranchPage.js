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
import {  Icon } from 'semantic-ui-react';
import { deleteBranch, fetchBranch } from '../../actions/project/Branch';
import { fetchProject, setBranch } from '../../actions/project/Project';
import { fetchProjects } from '../../actions/project/ProjectListing';
import ContentSpinner from '../../components/ContentSpinner';
import { FetchError } from '../../components/Message';
import ResourcePage from '../../components/ResourcePage';
import { BranchResource } from '../../util/App';
import { branchPageUrl, notebookPageUrl } from '../../util/App.js';

import '../../../css/App.css';
import '../../../css/ProjectPage.css';
import '../../../css/BranchHistory.css';


/**
 * The branch history page displays the list of workflow versions that form the
 * history of a project branch. For each version the action that created the
 * workflow is shown together with the time of creation. The user can select
 * any of the workflow versions and display them in a different page.
 *
 */

class BranchPage extends Component {
    static propTypes = {
        actionError: PropTypes.object,
        branch: PropTypes.object,
        fetchError: PropTypes.object,
        isActive: PropTypes.bool.isRequired,
        isFetching: PropTypes.bool.isRequired,
        project: PropTypes.object,
        projectList: PropTypes.array,
        serviceApi: PropTypes.object,
        userSettings: PropTypes.object.isRequired,
        workflows: PropTypes.array
    }
    /**
     * Fetch project information when page is loaded.
     */
    constructor(props) {
        super(props);
        const { branch, dispatch, project, projectList, workflows } = this.props;
        // Get project and branch identifier from the URL
        const projectId = this.props.match.params.project_id;
        const branchId = this.props.match.params.branch_id;
        // Fetch any resources that are currently missing. It is assumed that
        // the branch is set if the project is set.
        dispatch(fetchProject(projectId, branchId, fetchBranch));
        if ((branch == null) || (branch.id !== branchId)) {
            dispatch(fetchBranch(project, project.findBranch(branchId)));
        } else if (workflows == null) {
            dispatch(fetchBranch(project, project.findBranch(branchId)));
        }
        // Get project listing if not set
        if (projectList == null) {
            dispatch(fetchProjects());
        }
    }
    /**
     * Ensure proper back and forward behaviour. It appears that when the user
     * uses the back and previous button in the browser the current state and
     * the previous state are the same but the branch identifier in the URL
     * is different.
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        // Check if the location path has changed. The change may either be
        // the result from a delete branch operation or the result of the user
        // usingthe back and forward buttons in their browser.
        if (prevProps.location.pathname !== this.props.location.pathname) {
            const { dispatch, project, branch } = this.props;
            const projectId = this.props.match.params.project_id;
            const branchId = this.props.match.params.branch_id;
            if ((project == null) || (project.id !== projectId)) {
                dispatch(fetchProject(projectId, branchId, fetchBranch));
            } else if ((branch == null) || (branch.id !== branchId)) {
                dispatch(fetchBranch(project, project.findBranch(branchId)));
            }
        }
    }
    /**
     * Delete the given branch. Switch to the project default branch on success.
     */
    handleDeleteBranch = (branch) => {
        const { dispatch, history, project } = this.props;
        // The delete branch method will delete the branch on the server, update
        // the project and push the URL of the default branch onto the history
        // stack. This should trigger the component to render that branch.
        dispatch(deleteBranch(project, branch, branchPageUrl, history));
    }
    /**
     * Push URL for notebook page onto history stack. This will render a new
     * component.
     */
    handleShowWorkflow = (workflow, isHead) => {
        const { branch, history, project } = this.props;
        let workflowId = null;
        if ((!isHead) && (workflow != null)) {
            workflowId = workflow.id;
        }
        history.push(notebookPageUrl(project.id, branch.id, workflowId));
    }
    /**
     * Dispatch actions to switch to a given branch and load the branch history.
     */
    handleSwitchBranch = (branch) => {
        const { dispatch, history, project } = this.props;
        history.push(branchPageUrl(project.id, branch.id));
        dispatch(setBranch(project, branch.id, fetchBranch));
    }
    /**
     * The branch history is rendered as a table with five columns: (1) the
     * workflow version identifier, (2) an icon containing a link to display
     * the workflow version in a web page, (3) an icon depicting the type of
     * action that created the workflow version (i.e., CREATE BRANCH,
     * INSERT/APPEND MODULE, DELETE MODULE, or REPLACE MODULE), (4) the short
     * form of the command specification that was used to define the module
     * that was affected by the action, and (5) the time of creation.
     */
    render() {
        const {
            actionError,
            branch,
            dispatch,
            fetchError,
            isActive,
            isFetching,
            project,
            projectList,
            serviceApi,
            userSettings,
            workflows
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
        } else if ((project == null) || (branch == null) || (workflows == null) || (isFetching)) {
            // Show a spinner while the project information is being fetched.
            // There is nothing else to show yet.
            content = <ContentSpinner text='Loading History ...' />;
        } else if (workflows != null) {
            // The branch history has been fetched successfully. Show a table
            // containing the different workflow versions.
            const rows = [];
            for (let i = 0; i < workflows.length; i++) {
                const wf = workflows[i];
                let icon = null;
                let action = null;
                let command = null;
                let color = 'black';
                if (wf.actionIsCreate()) {
                    icon = 'fork';
                    color = 'grey';
                    action = 'Create branch';
                } else {
                    if (wf.actionIsDelete()) {
                        icon = 'trash';
                        color = 'red';
                        action = 'Delete cell';
                    } else if (wf.actionIsAppend()) {
                        icon = 'add square';
                        color = 'green';
                        action = 'Append cell';
                    } else if  (wf.actionIsInsert()) {
                        icon = 'add circle';
                        color = 'olive';
                        action = 'Insert cell';
                    } else if (wf.actionIsReplace()) {
                        icon = 'pencil';
                        color = 'blue';
                        action = 'Replace cell';
                    }
                    command = serviceApi
                        .engine
                        .packages
                        .getCommandSpec(wf.packageId, wf.commandId)
                        .name;
                }
                const isHead = (i === workflows.length - 1);
                rows.push(
                    <tr key={wf.id}>
                        <td className='workflow-nr'>{wf.id}</td>
                        <td className='workflow-icon'>
                            <Icon
                                title='Show notebook'
                                link name={'eye'}
                                onClick={() => (this.handleShowWorkflow(wf, isHead))}
                            />
                        </td>
                        <td className='workflow-icon'><Icon title={action} name={icon} color={color}/></td>
                        <td className='workflow-command'>{command}</td>
                        <td className='version-timestamp'>{wf.createdAt}</td>
                    </tr>
                )
            }
            const pageContent = (
                <div className='branch-history'>
                    <h1 className='branch-history'>
                        {'Notebooks in Branch '}
                        <span className='branch-highlight'>{branch.name}</span>
                    </h1>
                    <p className='info-text'>This is a list of all notebook versions in the history of
                        the branch {branch.name}. Click on the&nbsp; <Icon name='eye' /> to display a notebook.
                    </p>
                    <table><tbody>{rows}</tbody></table>
                </div>
            );
            // Show branch history table as the main content in a project
            // resource page
            content = (
                <ResourcePage
                    actionError={actionError}
                    branch={branch}
                    content={pageContent}
                    contentCss='slim'
                    dispatch={dispatch}
                    isActive={isActive}
                    onDeleteBranch={this.handleDeleteBranch}
                    onShowNotebook={this.handleShowWorkflow}
                    onSwitchBranch={this.handleSwitchBranch}
                    project={project}
                    projectList={projectList}
                    resource={new BranchResource()}
                    serviceApi={serviceApi}
                    userSettings={userSettings}
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
        fetchError: state.branchPage.fetchError,
        isActive: state.projectPage.isActive,
        isFetching: state.branchPage.isFetching,
        project: state.projectPage.project,
        projectList: state.projectListing.projects,
        serviceApi: state.serviceApi,
        userSettings: state.app.userSettings,
        workflows: state.branchPage.workflows
    }
}


export default withRouter(connect(mapStateToProps)(BranchPage))
