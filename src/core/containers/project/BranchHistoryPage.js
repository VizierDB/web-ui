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
import {  Icon } from 'semantic-ui-react';
import { fetchBranchHistory } from '../../actions/project/Branch';
import { fetchProject, } from '../../actions/project/ProjectPage';
import ProjectResourcePage from '../../components/project/ProjectResourcePage';
import ContentSpinner from '../../components/ContentSpinner';
import { FetchError } from '../../components/Message';

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
class BranchHistoryPage extends Component {
    static propTypes = {
        branch: PropTypes.object,
        fetchError: PropTypes.object,
        isFetching: PropTypes.bool.isRequired,
        project: PropTypes.object,
        serviceApi: PropTypes.object,
        workflows: PropTypes.array
    }
    /**
     * Fetch project information when page is loaded.
     */
    constructor(props) {
        super(props);
        const { dispatch, project, branch, workflows } = this.props;
        // Get project and branch identifier from the URL
        const projectId = this.props.match.params.project_id;
        const branchId = this.props.match.params.branch_id;
        // Fetch any resources that are currently missing. It is assumed that
        // the branch is set if the project is set.
        if (project == null) {
            dispatch(fetchProject(projectId, branchId, fetchBranchHistory));
        } else if (workflows == null) {
            dispatch(fetchBranchHistory(project, branch));
        }
    }
    handleShowWorkflow = (workflow) => {
        alert(workflow.id);
    }
    /**
     * The branch history is rendered as a table with five columns: (1) an
     * icon depicting the type of action that created the workflow version
     * (i.e., CREATE BRANCH, INSERT/APPEND MODULE, DELETE MODULE, or REPLACE
     * MODULE), (2) an icon containing a link to show the workflow version,
     * (3 and 4) the short form of the command specification that was used
     * to define the module that was affected by the action, and (5) the time
     * of creation.
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
            serviceApi,
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
                    action = 'Create';
                } else {
                    if (wf.actionIsDelete()) {
                        icon = 'trash';
                        color = 'red';
                        action = 'Delete';
                    } else if (wf.actionIsAppend()) {
                        icon = 'add square';
                        color = 'green';
                        action = 'Append';
                    } else if  (wf.actionIsInsert()) {
                        icon = 'add circle';
                        color = 'green';
                        action = 'Insert';
                    } else if (wf.actionIsReplace()) {
                        icon = 'pencil';
                        color = 'blue';
                        action = 'Edit';
                    }
                    command = project.packages[wf.packageId].commands[wf.commandId].name;
                }
                rows.push(
                    <tr key={wf.id}>
                        <td className='workflow-icon'><Icon name={icon} color={color}/></td>
                        <td className='workflow-icon'>
                            <Icon
                                title='Show notebook'
                                link name={'eye'}
                                onClick={() => (this.handleShowWorkflow(wf))}
                            />
                        </td>
                        <td className='workflow-nr'>{wf.id}</td>
                        <td className='workflow-action'>{action}</td>
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
                <ProjectResourcePage
                    actionError={actionError}
                    branch={branch}
                    content={pageContent}
                    contentCss='wide'
                    dispatch={dispatch}
                    isActive={isActive}
                    project={project}
                    serviceApi={serviceApi}
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
        fetchError: state.branchHistoryPage.fetchError,
        isActive: state.projectPage.isActive,
        isFetching: state.branchHistoryPage.isFetching,
        project: state.projectPage.project,
        serviceApi: state.serviceApi,
        workflows: state.branchHistoryPage.workflows
    }
}

export default connect(mapStateToProps)(BranchHistoryPage)
