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
import { fetchAuthed, checkResponseJsonForReAuth, requestAuth } from '../main/Service';
import { ProjectDescriptor } from '../../resources/Project';
import { HATEOASReferences, HATEOAS_PROJECTS_DELETE, HATEOAS_PROJECTS_LIST } from '../../util/HATEOAS';
import { createResource, deleteResource } from '../../util/Api'
import { notebookPageUrl } from '../../util/App';
import { sortByName } from '../../util/Sort';

/**
* Actions to update the internal state maintaining the project listing on
* the main page.
*/
export const CLEAR_PROJECT_ACTION_ERROR = 'CLEAR_PROJECT_ACTION_ERROR'
export const REQUEST_PROJECTS = 'REQUEST_PROJECTS'
export const RECEIVE_PROJECTS = 'RECEIVE_PROJECTS'
export const SET_PROJECT_CREATE_ERROR = 'SET_PROJECT_CREATE_ERROR'
export const SET_PROJECT_DELETE_ERROR = 'SET_PROJECT_DELETE_ERROR'
export const SET_PROJECTS_FETCH_ERROR = 'SET_PROJECTS_FETCH_ERROR'
export const SET_PROJECTS_UPLOAD_ERROR = 'SET_PROJECTS_UPLOAD_ERROR'



/**
 * Handle errors when deleting a project.
 */
export const clearProjectActionError = () => ({
    type: CLEAR_PROJECT_ACTION_ERROR
})


/**
 * Create a new project.
 */
export const createProject = (url, name, history) => (dispatch) =>  {
    // Trim project name. If empty set to default value.
    let projectName = name.trim();
    if (projectName === '') {
        projectName = 'New Project';
    }
    // Signal start of create project action
    dispatch(requestProjects('Create Project ...'))
    // Set request body
    const data = {properties: []}
    if (name.trim() !== '') {
        data.properties.push({key: 'name', value: projectName})
    }
    // Dispatch create resource request
    dispatch(
        createResource(
            url,
            data,
            (json) => {
                dispatch(fetchProjects());
                history.push(notebookPageUrl(json.id, json.defaultBranch));
                // Avoid action undefined error
                return ({type: NO_OP});
            },
            projectCreateError
    ));
}


/**
 * Send DELETE request for project with given Url
 */
export const deleteProject = (project) => (dispatch) => {
    dispatch(
        deleteResource(
            project.links.get(HATEOAS_PROJECTS_DELETE),
            fetchProjects,
            projectDeleteError,
            () => (requestProjects('Delete Project ...'))
        )
    )
}


/**
 * Action to retrieve project listing. Expects that the Web Service Url has been
 * set during App initialization.
 *
 */
export const fetchProjects = () => (dispatch, getState) => {
    // Get project Url from the API reference set. This set may not have been
    // initialized yet!
    if (getState().serviceApi.links) {
        const url = getState().serviceApi.links.get(HATEOAS_PROJECTS_LIST);
        // Signal start of fetching project listing
        dispatch(requestProjects())
        return fetchAuthed(url)(dispatch)
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: Pass the JSON result to the respective callback
                // handler
                checkResponseJsonForReAuth(response).then(json => dispatch(receiveProjects(json)));
            } else if(response.status === 401) {
            	// UNAUTHORIZED: re-request auth
            	dispatch(requestAuth());
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                checkResponseJsonForReAuth(response).then(json => dispatch(projectsFetchError(json.message)));
            }
        })
        .catch(err => dispatch(projectsFetchError(err.message)))
    }
}

/**
 * upload a project export
 *
 * Parameters:
 *
 * uploadUrl: string
 *
 */
export const uploadProject = (uploadUrl, fileArg, history) => (dispatch) => {
    const file = fileArg;
    const uploadReqData = new FormData();
    uploadReqData.append('file', file);
    const req = {
        method: 'POST',
        body: uploadReqData
    }
    return fetchAuthed(
            uploadUrl,
            req
        )(dispatch)
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: Fetch updated file identifier and modify the
                // request body to update the notebook.
                checkResponseJsonForReAuth(response).then(json => {
                    console.log('FILE RESPONSE');
                    console.log(json);
                    let defaultBranch = json.defaultBranch;
                    if(!defaultBranch){
                    	defaultBranch = json.branches[0].id;
                    }
                    history.push(notebookPageUrl(json.id, defaultBranch));
                    // Avoid action undefined error
                    return ({type: NO_OP});
                });
            } else if(response.status === 401) {
            	// UNAUTHORIZED: re-request auth
            	dispatch(requestAuth())
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message. For some response
                // codes, however, this is not true (e.g. 413).
                // TODO: Catch the cases where there is no Json response
                checkResponseJsonForReAuth(response).then(json => dispatch(
                		projectsUploadError('Error updating workflow', json.message))
                )
            }
        })
        .catch(err => {
            let msg = err.message;
            if (msg === 'NetworkError when attempting to fetch resource.') {
                msg = 'Connection closed by server. The file size may exceed the server\'s upload limit.'
            }
            dispatch(projectsUploadError('Error updating workflow', msg))
        });
}



/**
 * Handle errors when retrieving the project listing.
 */
export const projectCreateError = (error) => ({
    type: SET_PROJECT_CREATE_ERROR,
    error
})


/**
 * Handle errors when deleting a project.
 */
const projectDeleteError = (error) => ({
    type: SET_PROJECT_DELETE_ERROR,
    error
})


/**
 * Handle errors when retrieving the project listing.
 */
const projectsUploadError = (error) => ({
    type: SET_PROJECTS_UPLOAD_ERROR,
    error
})

/**
 * Handle errors when retrieving the project listing.
 */
const projectsFetchError = (error) => ({
    type: SET_PROJECTS_FETCH_ERROR,
    error
})


/**
 * Signal start of project listing fetch.
 */
const requestProjects = (message) => ({
    type: REQUEST_PROJECTS,
    message
})


/**
 * Handler for successful retrieval of project listing.
 */
const receiveProjects = (json) => {
    const projects = [];
    for (let i = 0; i < json.projects.length; i++) {
        projects.push(new ProjectDescriptor().fromJson(json.projects[i]));
    }
    sortByName(projects);
    return {
        type: RECEIVE_PROJECTS,
        projects: projects,
        links: new HATEOASReferences(json.links)
    };
}
