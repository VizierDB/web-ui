/**
 * Actions to update the internal state maintaining the project listing on
 * the main page.
 */

import {
    createResource, deleteResource, updateResourceProperty
} from '../../util/Api'

export const PROJECT_SUBMITTING = 'PROJECT_SUBMITTING'
export const REQUEST_PROJECTS = 'REQUEST_PROJECTS'
export const RECEIVE_PROJECTS = 'RECEIVE_PROJECTS'
export const SET_PROJECT_CREATE_ERROR = 'SET_PROJECT_CREATE_ERROR'
export const SET_PROJECT_DELETE_ERROR = 'SET_PROJECT_DELETE_ERROR'
export const SET_PROJECT_EDIT_ERROR_LISTING = 'SET_PROJECT_EDIT_ERROR_LISTING'
export const SET_PROJECTS_FETCH_ERROR = 'SET_PROJECTS_FETCH_ERROR'


/**
 * Create a new project.
 */
export const createProject = (url, env, name) => (dispatch) =>  {
    // Signal start of create project action
    dispatch(projectSubmitting(true))
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
            requestProjects
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
        return fetch(url)
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: Pass the JSON result to the respective callback
                // handler
                response.json().then(json => dispatch(receiveProjects(json)));
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
 * Handle errors when retrieving the project listing.
 */
const projectCreateSuccess = () => (dispatch) => {
    dispatch(projectSubmitting(false))
    dispatch(fetchProjects())
}

/**
 * Handle errors when deleting a project.
 */
export const projectDeleteError = (error) => ({
    type: SET_PROJECT_DELETE_ERROR,
    error
})

/**
 * Handle errors during update of project name in project listing component.
 */
export const projectEditErrorInListing = (error) => ({
    type: SET_PROJECT_EDIT_ERROR_LISTING,
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
 * Set the isSubmitting flag for the create project form.
 */
const projectSubmitting = (flag) => ({
    type: PROJECT_SUBMITTING,
    flag
})

/**
 * Signal start of project listing fetch.
 */
const requestProjects = () => ({
  type: REQUEST_PROJECTS
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
 * Submit request to update project name in project listing.
 */
export const updateProjectNameInListing = (project, name) => {
    return updateResourceProperty(
        project.links.update,
        'name',
        name,
        fetchProjects,
        projectEditErrorInListing,
        requestProjects
    )
}
