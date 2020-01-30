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

import { ProjectHandle } from '../../resources/Project';
import { getProperty, updateResourceProperty } from '../../util/Api';
import { ErrorObject } from '../../util/Error';
import { HATEOAS_PROJECT_UPDATE_PROPERTY } from '../../util/HATEOAS';
import { fetchAuthed, checkResponseJsonForReAuth, requestAuth } from '../main/Service';

// Actions for fetching project information from Web API.
export const PROJECT_FETCH_ERROR = 'PROJECT_FETCH_ERROR';
export const RECEIVE_PROJECT = 'RECEIVE_PROJECT';
export const REQUEST_PROJECT = 'REQUEST_PROJECT';

// Actions when fetching or manipulating project resources
export const PROJECT_ACTION_ERROR = 'PROJECT_ACTION_ERROR';
export const RECEIVE_PROJECT_RESOURCE = 'RECEIVE_PROJECT_RESOURCE';
export const REQUEST_PROJECT_ACTION = 'REQUEST_PROJECT_ACTION';
export const UPDATE_PROJECT = 'UPDATE_PROJECT';
export const UPDATE_RESOURCE = 'UPDATE_RESOURCE';
export const UPDATE_WORKFLOW = 'UPDATE_WORKFLOW';

/**
 * Fetch project and branch from API. Calls the given result function to
 * fetch further resources on success.
 *
 */
export const fetchProject = (projectId, branchId, resultFunc) => (dispatch, getState) => {
    // Construct project url from the API reference set. This set may not be
    // initialized yet!
    if (getState().serviceApi.links) {
        let url = getState().serviceApi.links.getProjectUrl(projectId);
        // Signal start of fetching project listing
        dispatch(requestProject())
        // Fetch the project.
        return fetchAuthed(url)(dispatch)
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: The returned json object is expected to contain
                // the project handle (.project), workflow handle (.workflow),
                //  workflow modules (.modules), and all dataset descriptors
                // (.datasets). The last two are used to generate the notebook.
                checkResponseJsonForReAuth(response).then(json => {
                    const project = new ProjectHandle().fromJson(json);
                    let branch = null;
                    if (branchId != null) {
                        branch = project.branches.find((br) => (br.id === branchId));
                    } else {
                        branch = project.branches.find((br) => (br.isDefault));
                    }
                    if (branch != null) {
                        dispatch({type: RECEIVE_PROJECT, project, branch});
                        dispatch(resultFunc(project, branch));
                    } else {
                        dispatch(projectFetchError('Unknown branch ' + branchId, 404));
                    }
                });
            } else if(response.status === 401) {
            	// UNAUTHORIZED: re-request auth
            	dispatch(requestAuth())
            } else if (response.status === 404) {
                // The requested project, branch, or workflow does not exist.
                checkResponseJsonForReAuth(response).then(json => (dispatch(
                    projectFetchError(json.message, 404)
                )));
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                checkResponseJsonForReAuth(response).then(json => dispatch(
                    projectFetchError(json.message, response.status)
                ));
            }
        })
        .catch(err => dispatch(projectFetchError(err.message)))
    }
}

/**
 * Set the resource that is shown as page content. Expects a ProjectResource
 * object.
 *
 */
export const receiveProjectResource = (resource) => ({
    type: RECEIVE_PROJECT_RESOURCE,
    resource: resource
})

export const setProject = (project) => ({
    type: UPDATE_PROJECT,
    project
});


// -----------------------------------------------------------------------------
// Switch Branch
// -----------------------------------------------------------------------------

export const setBranch = (project, branchId, resultFunc) => (dispatch) => {
    let branch = project.findBranch(branchId);
    if (branch != null) {
        dispatch({type: RECEIVE_PROJECT, project, branch});
        if (resultFunc) {
            dispatch(resultFunc(project, branch));
        }
    } else {
        dispatch(projectFetchError('Unknown branch ' + branchId, 404));
    }
}


// -----------------------------------------------------------------------------
// Updates
// -----------------------------------------------------------------------------

/**
 * .Update the name of the current project. Send a post request to the API
 * and modify the project handle in the global state.
 */
export const updateProject = (project, name) => (dispatch) => {
    dispatch(
        updateResourceProperty(
            project.links.get(HATEOAS_PROJECT_UPDATE_PROPERTY),
            'name',
            name,
            (json) => (dispatch) => (dispatch({
                type: UPDATE_PROJECT,
                project: project.updateName(getProperty(json, 'name'))
            })),
            (message) => (projectActionError(
                'Error updating project', message
            )),
            requestProjectAction
        )
    );
}


/**
 * Update the resource that is shown on the project page. This function is for
 * example used when changing the output of a notebook cell which modifies the
 * notebook resource.
 */
export const updateResource = (resource) => ({
    type: UPDATE_RESOURCE,
    resource
})


/**
 * Set the workflow handle and page content in the global state to the given
 * values. This funcion is used when the underlying workflow was updated either
 * in notebook view or in spreadsheet view.
 */
export const updateWorkflowResource = (workflow, resource) => ({
    type: UPDATE_WORKFLOW,
    workflow,
    resource
})


// -----------------------------------------------------------------------------
// Errors
// -----------------------------------------------------------------------------

/**
 * Dismiss any project action error message that may be shown by setting the
 * respective property in the global state to null.
 */
export const dismissProjectActionError = (title, message) => ({
     type: PROJECT_ACTION_ERROR,
     error: null
})

/**
 * Error while fetching a project resource, creating a new project branch,
 * or updating the project name.
 */
export const projectActionError = (title, message) => ({
    type: PROJECT_ACTION_ERROR,
    error: new ErrorObject(title, message)
})


/**
 * Error generated while fetching a project.
 */
export const projectFetchError = (message, status, title) => {
    if (title == null) {
        title = 'Error fetching project';
    }
    return {
        type: PROJECT_FETCH_ERROR,
        error: new ErrorObject(title, message, status)
    }
}


// -----------------------------------------------------------------------------
// Busy flags
// -----------------------------------------------------------------------------

/**
 * Signal start of fetching a single project.
 */
export const requestProject = () => ({
  type: REQUEST_PROJECT
})

/**
 * Signal start fetching a resource that is associated with a project (e.g., a
 * project branch or workflow).
 */
export const requestProjectResource = () => (requestProject());

/**
 * Signal start of an action that fetces or manipulates a project property or
 * resource.
 */
export const requestProjectAction = () => ({
  type: REQUEST_PROJECT_ACTION
})
