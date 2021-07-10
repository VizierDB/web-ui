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
// import {  Icon } from 'semantic-ui-react';
import { fetchBranch } from '../../actions/project/Branch';
import { fetchProject } from '../../actions/project/Project';
import { fetchProjects } from '../../actions/project/ProjectListing';
import ContentSpinner from '../../components/ContentSpinner';
import { FetchError } from '../../components/Message';
import ResourcePage from '../../components/ResourcePage';
import { DatasetCaveatResource } from '../../util/App';
import { notebookPageUrl } from '../../util/App.js';
import { showSpreadsheet, repairDatasetCaveat } from '../../actions/project/Spreadsheet';

import DatasetCaveat from '../../components/project/DatasetCaveat';
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

class DatasetCaveatsPage extends Component {
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
        workflows: PropTypes.array,
        dataset: PropTypes.object,
        resource: PropTypes.object
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
        if ((project == null) || (project.id !== projectId)) {
            dispatch(fetchProject(projectId, branchId, fetchBranch));
        } else if ((branch == null) || (branch.id !== branchId)) {
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
     * Dispatch action to load the workflow at the head of the current branch.
     */
    handleShowBranchHead = () => {
        const { branch, history, project } = this.props;
        history.push(notebookPageUrl(project.id, branch.id));
    }

    /**
     * Switch to spreadsheet view and load the selected to the page
     * that has the source of a specific error.
     */
    loadDatasetToError = (dataset) => (reason) => {
    	const { dispatch, serviceApi } = this.props;
    	const fetch_url = serviceApi.serviceUrl + '/datasets/' + dataset.id + '?rowid='+reason.key[0]
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
            workflows,
            resource
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
        } else if ((project == null) || (branch == null) || (workflows == null) || (resource == null) || (isFetching)) {
            // Show a spinner while the project information is being fetched.
            // There is nothing else to show yet.
            content = <ContentSpinner text='Loading Dataset Caveat List ...' />;
        } else if (resource != null) {
        	const dataset = resource.content.dataset;
        	const annotations = resource.content.annotations;
        	const pageContent = (
                    <div className='dataset-caveat-view'>
                        <DatasetCaveat
                            dataset={dataset}
                            annotations={annotations}
                        	onGotoError={this.loadDatasetToError}
                        	onRepairError={this.loadDatasetRepair}
                        />
                    </div>
                )
            
            
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
                    project={project}
                    projectList={projectList}
                    resource={DatasetCaveatResource()}
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
        branch: state.projectPage.branch,
        fetchError: state.datasetErrorsPage.fetchError,
        isActive: state.projectPage.isActive,
        isFetching: state.datasetErrorsPage.isFetching,
        project: state.projectPage.project,
        projectList: state.projectListing.projects,
        serviceApi: state.serviceApi,
        userSettings: state.app.userSettings,
        workflows: state.branchPage.workflows,
        dataset: state.datasetErrorsPage.dataset,
        resource: state.datasetErrorsPage.resource,
    }
}


export default withRouter(connect(mapStateToProps)(DatasetCaveatsPage))
