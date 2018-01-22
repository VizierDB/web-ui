/**
 * Actions to interact with a data curation workflow.
 */

import { WorkflowHandle } from '../../util/Api'

export const FETCH_WORKFLOW_ERROR = 'FETCH_WORKFLOW_ERROR'
export const RECEIVE_WORKFLOW = 'RECEIVE_WORKFLOW'
export const REQUEST_WORKFLOW = 'REQUEST_WORKFLOW'


/**
 * Fetch the workflow with the given Url.
 */
export const fetchWorkflow = (url) => (dispatch) => {
    // Signal start of workflow fetching
    dispatch(requestWorkflow())
    return fetch(url)
    // Check the response. Assume that eveything is all right if status
    // code below 400
    .then(function(response) {
        if (response.status >= 200 && response.status < 400) {
            // SUCCESS: Pass the JSON result to the respective callback
            // handler
            response.json().then(json => {
                dispatch(receiveWorkflow(new WorkflowHandle(json)))
            });
        } else {
            // ERROR: The API is expected to return a JSON object in case
            // of an error that contains an error message
            response.json().then(json => dispatch(setFetchWorkflowError('Error while fetching workflow', json.message)));
        }
    })
    .catch(err => dispatch(setFetchWorkflowError('Error while fetching workflow', err.message)))
}

/**
 * Set the handle for the current workflow of the project page.
 */
export const receiveWorkflow = (workflow) => ({
    type: RECEIVE_WORKFLOW,
    workflow
})

/**
 * Signal start of workflow request.
 */
export const requestWorkflow = () => ({
    type: REQUEST_WORKFLOW
})

/**
 * Set an error message generated while fetching a data curation workflow
 */
export const setFetchWorkflowError = (title, message) => ({
    type: FETCH_WORKFLOW_ERROR,
    error: {
        title,
        message
    }
})
