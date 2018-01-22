import { receiveBranches } from './ProjectMenu'
import { fetchResource, HATEOASReferences, ModuleRegistry } from '../../util/Api'
import { receiveFiles } from '../fileserver/Fileserver'

export const RECEIVE_ENGINE_REPOSITORY = 'RECEIVE_ENGINE_REPOSITORY'
export const RECEIVE_PROJECT = 'RECEIVE_PROJECT'
export const REQUEST_PROJECT = 'REQUEST_PROJECT'
export const SET_PROJECT_FETCH_ERROR = 'SET_PROJECT_FETCH_ERROR'


/**
 * Action to retrieve project listing. Expects that the Web Service Url has been
 * set during App initialization.
 *
 */
export const fetchProject = (identifier) => (dispatch, getState) => {
    // Get project Url from the API reference set. This set may not have been
    // initialized yet!
    if (getState().serviceApi.links) {
        const url = getState().serviceApi.links.projects;
        // Signal start of fetching project listing
        dispatch(requestProject())
        // Read file listing
        dispatch(fetchResource(
            getState().serviceApi.links.files,
            receiveFiles,
            projectFetchError
        ))
        return fetch(url)
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: Pass the JSON result to the respective callback
                // handler
                response.json().then(json => {
                    const projects = json.projects;
                    for (let i = 0; i < projects.length; i++) {
                        const prj = projects[i]
                        if (prj.id === identifier) {
                            // Get project Url and fetch resource
                            const projectUrl = new HATEOASReferences(prj.links).self
                            return fetch(projectUrl)
                                // Check the response. Assume that eveything is all right if status
                                // code below 400
                                .then(function(response) {
                                    if (response.status >= 200 && response.status < 400) {
                                        // SUCCESS: Pass the JSON result to the respective callback
                                        // handler
                                        response.json().then(json => dispatch(receiveProject(json)));
                                    } else {
                                        // ERROR: The API is expected to return a JSON object in case
                                        // of an error that contains an error message
                                        response.json().then(json => dispatch(projectFetchError(json.message)));
                                    }
                                })
                                .catch(err => dispatch(projectFetchError(err.message)))
                        }
                    }
                    dispatch(projectFetchError('Project ' + identifier + ' not found'))
                });
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                response.json().then(json => dispatch(projectFetchError(json.message)));
            }
        })
        .catch(err => dispatch(projectFetchError(err.message)))
    }
}

/**
 * Handle errors when fetching a single project.
 */
const projectFetchError = (error) => ({
    type: SET_PROJECT_FETCH_ERROR,
    error
})

/**
 * Set the command repository of the engine that is associated with a project.
 */
const receiveEngineRepository = (modules) => ({
    type: RECEIVE_ENGINE_REPOSITORY,
    engineRepository: new ModuleRegistry(modules)
})

/**
 * Handler for successful retrieval of a single project.
 */
export const receiveProject = (json) => (dispatch) => {
    dispatch({
        type: RECEIVE_PROJECT,
        project: json
    })
    const branches = json.branches
    // Fetch the project's engine command repository
    return fetch(new HATEOASReferences(json.links).engine)
    // Check the response. Assume that eveything is all right if status
    // code below 400
    .then(function(response) {
        if (response.status >= 200 && response.status < 400) {
            // SUCCESS: Pass the JSON result to the respective callback
            // handler
            response.json().then(json => {
                dispatch(receiveBranches(branches))
                dispatch(receiveEngineRepository(json.modules))
            });
        } else {
            // ERROR: The API is expected to return a JSON object in case
            // of an error that contains an error message
            response.json().then(json => dispatch(projectFetchError(json.message)));
        }
    })
    .catch(err => dispatch(projectFetchError(err.message)))
}

/**
 * Signal start of fetching a single project.
 */
const requestProject = () => ({
  type: REQUEST_PROJECT
})
