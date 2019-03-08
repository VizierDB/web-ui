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

import { createResource, deleteResource } from '../../util/Api'
import { fetchAuthed, requestAuth } from '../main/Service';
import { pageUrl } from '../../util/App.js';

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
export const TOGGLE_SHOW_PROJECT_FORM = 'TOGGLE_SHOW_PROJECT_FORM'




/**
 * Handle errors when deleting a project.
 */
export const clearProjectActionError = () => ({
    type: CLEAR_PROJECT_ACTION_ERROR
})


/**
 * Create a new project.
 */
export const createProject = (url, env, name) => (dispatch) =>  {
    // Signal start of create project action
    dispatch(requestProjects('Create Project ...'))
    // Set request body
    const data = {environment: env.id, properties: []}
    if (name.trim() !== '') {
        data.properties.push({key: 'name', value: name.trim()})
    }
    // Dispatch create resource request
    dispatch(createResource(url, data, projectCreateSuccess, projectCreateError))
}


/**
 * Send DELETE request for project with given Url
 */
export const deleteProject = (project) => (dispatch) => {
    dispatch(
        deleteResource(
            project.links.delete,
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
        const url = getState().serviceApi.links.projects;
        // Signal start of fetching project listing
        dispatch(requestProjects())
        return fetchAuthed(url)(dispatch)
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: Pass the JSON result to the respective callback
                // handler
                response.json().then(json => dispatch(receiveProjects(json)));
            } else if(response.status === 401) {
            	// UNAUTHORIZED: re-request auth
            	dispatch(requestAuth())
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                response.json().then(json => dispatch(projectsFetchError(json.message)));
            }
        })
        .catch(err => dispatch(projectsFetchError(err.message)))
    }
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
const projectCreateSuccess = (proj) => (dispatch) => {
    let url = pageUrl(proj.id);
	window.location.assign(url);
}


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
const receiveProjects = (json) => ({
  type: RECEIVE_PROJECTS,
  projects: json.projects,
  links: json.links
})


/**
 * Toggle visibility of the create project form (showForm flag).
 */

export const toggleShowProjectForm = (value) => ({
    type: TOGGLE_SHOW_PROJECT_FORM,
    value
})
