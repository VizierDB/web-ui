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

import { redirectTo } from '../main/App';
import {
    projectActionError, receiveProjectResource, requestProject,
    replaceCurrentBranch, requestProjectAction
} from './ProjectPage';
import { BranchDescriptor, DEFAULT_BRANCH } from '../../resources/Branch';
import { BranchHistoryResource } from '../../resources/Project';
import { WorkflowDescriptor } from '../../resources/Workflow';
import {
    deleteResource, fetchResource, postResourceData, updateResourceProperty
} from '../../util/Api';
import { pageUrl } from '../../util/App';


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
 *
 */
export const createBranch = (project, workflow, module, name) =>  (dispatch) => {
    // Generate request body containing source information and branch properties
    const data = {
        source: {
            branch: workflow.branch.id,
            version: workflow.version,
            moduleId: module.id
        },
        properties: [{
            key: 'name',
            value: name
        }]
    }
    // POST request to branches url contained in the project handle's links. On
    // success, redirect to the page for the new branch.
    return postResourceData(
        dispatch,
        workflow.links.branches,
        data,
        (branch) => (redirectTo(pageUrl(project.id, branch.id))),
        (message) => (projectActionError(
            'Error creating new branch', message
        )),
        requestProject
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
 *
 */
export const deleteBranch = (project, branch) => (dispatch) => {
    dispatch(
        deleteResource(
            branch.links.delete,
            () => (redirectTo(pageUrl(project.id, DEFAULT_BRANCH))),
            (message) => (
                projectActionError('Error deleting branch', message)
            ),
            requestProject
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
export const showBranchHistory = (branch) => (dispatch) => {
    dispatch(
        fetchResource(
            branch.links.self,
            (json) => (dispatch) => {
                // Expect a listing of workflow version descriptors.
                const workflows = json.workflows;
                const history = [];
                for (let i = 0; i < workflows.length; i++) {
                    const wf = workflows[i];
                    history.push(new WorkflowDescriptor().fromJson(wf))
                }
                return dispatch(
                    receiveProjectResource(new BranchHistoryResource(history))
                );
            },
            (message) => (
                projectActionError('Error fetching branch history', message)
            ),
            requestProjectAction
        )
    )
}


/**
 * Update the name of the branch in the current workflow. On success, call
 * replaceCurrentBranch to update the branch listing in the current project
 * handle and the branch in the current workflow.
 *
 * Parameters:
 *
 * project: ProjectHandle
 * workflow: WorkflowHandle
 * name: string
 *
 */
export const updateBranchName = (project, workflow, name) => (dispatch) => {
    dispatch(
        updateResourceProperty(
            workflow.branch.links.update,
            'name',
            name,
            (json) => (dispatch) => {
                // The returned object is a branch descriptor.
                return dispatch(
                    replaceCurrentBranch(
                        project,
                        workflow,
                        new BranchDescriptor().fromJson(json)
                    )
                );
            },
            (message) => (
                projectActionError('Error updating branch', message)
            ),
            requestProjectAction
        )
    )
}
