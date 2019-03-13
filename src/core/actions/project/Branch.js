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

import { NO_OP } from '../main/App';
import { projectActionError, projectFetchError, requestProjectAction, setBranch, setProject } from './Project';
import { BranchDescriptor } from '../../resources/Branch';
import { WorkflowDescriptor } from '../../resources/Workflow';
import { createResource, deleteResource, fetchResource, getProperty, updateResourceProperty } from '../../util/Api';
import { notebookPageUrl } from '../../util/App';
import { HATEOAS_BRANCH_UPDATE_PROPERTY } from '../../util/HATEOAS';


// Actions for manipulating branches and retrieving branch information
export const UPDATE_BRANCH = 'UPDATE_BRANCH';
export const RECEIVE_BRANCH_HISTORY = 'RECEIVE_BRANCH_HISTORY';
export const REQUEST_BRANCH = 'REQUEST_BRANCH'


/**
 * Create a new project branch with given name. The branch is created from
 * the source that is defined by the given workflow and module.
 *
 * Parameters:
 *
 * project: ProjectHandle
 * workflow: WorkflowHandle
 * module: ModuleHandle
 * name: string
 * history: Browser history stack
 *
 */
export const createBranch = (project, branch, workflowId, moduleId, name, history) =>  (dispatch) => {
    // Generate request body containing source information and branch
    // properties. The branch source is empty if the given module identifier
    // is empty
    const data = {
        properties: [{
            key: 'name',
            value: name
        }]
    }
    if (moduleId != null) {
        data.source = {
            branchId: branch.id,
            workflowId: workflowId,
            moduleId: moduleId
        }
    }
    // POST request to branches url contained in the project handle's links. On
    // success, redirect to the page for the new branch.
    dispatch(
        createResource(
            project.links.get('branch.create'),
            data,
            (json) => {
                const resultBranch = new BranchDescriptor().fromJson(json);
                dispatch(setProject(project.addBranch(resultBranch)));
                history.push(notebookPageUrl(project.id, resultBranch.id));
                // Avoid action undefined error
                return ({type: NO_OP});
            },
            (message) => (
                projectActionError('Error creating new branch', message)
            ),
            requestBranch
        )
    )
}


/**
 * Delete a project branch. Expects the project and branch handles as arguments.
 * Uses the delete url in the branch handle's links. On success, redirect to the
 * page for the default branch.
 *
 * Parameters:
 *
 * project: ProjectHandle
 * branch: BranchDescriptor
 * redirectAction: Dispatch action to redirect to the default brnach in case of
 *                 successful delete
 */
export const deleteBranch = (project, branch, urlFactory, history) => (dispatch) => {
    dispatch(
        deleteResource(
            branch.links.get('branch.delete'),
            () => {
                dispatch(setProject(project.deleteBranch(branch.id)));
                const defaultBranchId = project.getDefaultBranch().id;
                history.push(urlFactory(project.id, defaultBranchId));
                // Avoid action undefined error
                return ({type: NO_OP});
            },
            (message) => (
                projectActionError('Error deleting branch', message)
            ),
            requestBranch
        )
    )
}


/**
 * Fetch the full history of a given project branch. On success, the returned
 * result is expected to contain a listing of workflow version descriptors
 * (.workflows). Show the result as content on the project page.
 *
 * Parameters:
 *
 * branch: BranchDescriptor
 *
 */
export const fetchBranch = (project, branch) => (dispatch) => {
    if (branch == null) {
        dispatch(setBranch(project));
    } else {
        dispatch(
            fetchResource(
                branch.links.getSelf(),
                (json) => (dispatch) => {
                    // Expect a listing of workflow version descriptors.
                    const workflows = json.workflows;
                    const history = [];
                    for (let i = 0; i < workflows.length; i++) {
                        const wf = workflows[i];
                        history.push(new WorkflowDescriptor().fromJson(wf))
                    }
                    dispatch(setBranch(project, branch.id));
                    dispatch({
                        type: RECEIVE_BRANCH_HISTORY,
                        workflows: history
                    });
                },
                (message) => (
                    projectFetchError(message, 400, 'Error fetching branch history')
                ),
                requestBranch,
            )
        )
    }
}


/**
 * Signal start when fething the branch history.
 */
export const requestBranch = () => ({ type: REQUEST_BRANCH });

/**
 * Update the name of the branch in the current workflow. On success, call
 * replaceCurrentBranch to update the branch listing in the current project
 * handle and the branch in the current workflow.
 *
 * Parameters:
 *
 * project: ProjectHandle
 * branch: BranchHandle
 * name: string
 *
 */
export const updateBranch = (project, branch, name) => (dispatch) => {
    dispatch(
        updateResourceProperty(
            branch.links.get(HATEOAS_BRANCH_UPDATE_PROPERTY),
            'name',
            name,
            (json) => (dispatch) => {
                // Create an updated branch descriptor with the new name
                const updBranch = branch.updateName(getProperty(json, 'name'));
                // Need to modify the project as well since it contains a
                // reference to all the branches
                return dispatch({
                    type: UPDATE_BRANCH,
                    branch: updBranch,
                    project: project.updateBranch(updBranch)
                });
            },
            (message) => (
                projectActionError('Error updating branch', message)
            ),
            requestProjectAction
        )
    )
}
