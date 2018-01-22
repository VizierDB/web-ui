/**
 * Actions to interact with the spreadsheet view of a dataset.
 */

import { showNotebookView } from '../project/ProjectMenu'
import { receiveWorkflow } from '../project/Workflow'
import { postResourceData, WorkflowHandle } from '../../util/Api'

export const RECEIVE_SPREADSHEET_DATA = 'RECEIVE_SPREADSHEET_DATA'
export const REQUEST_SPREADSHEET_DATA = 'REQUEST_SPREADSHEET_DATA'
export const REQUEST_SPREADSHEET_UPDATE = 'REQUEST_SPREADSHEET_UPDATE'
export const SPREADSHEET_ERROR = 'SPREADSHEET_ERROR'
export const SPREADSHEET_OPERATION_ERROR = 'SPREADSHEET_OPERATION_ERROR'


export const clearSpreadsheetOperationError = () => ({
    type: SPREADSHEET_OPERATION_ERROR,
    error: null
})

export const fetchSpreadsheet = (url, name) => (dispatch) => {
    // Signal start of dataset fetching
    dispatch(requestSpreadsheet())
    return fetch(url)
    // Check the response. Assume that eveything is all right if status
    // code below 400
    .then(function(response) {
        if (response.status >= 200 && response.status < 400) {
            // SUCCESS: Pass the JSON result to the respective callback
            // handler
            response.json().then(json => {
                dispatch(receiveSpreadsheet(json, name))
            });
        } else {
            // ERROR: The API is expected to return a JSON object in case
            // of an error that contains an error message
            response.json().then(json => dispatch(spreadsheetFetchError(json.message)));
        }
    })
    .catch(err => dispatch(spreadsheetFetchError(err.message)))
}

export const receiveSpreadsheet = (dataset, name) => ({
    type: RECEIVE_SPREADSHEET_DATA,
    dataset,
    name
})

/**
 * Set busy flag during spreadsheet fetch. Will also invalidate the current
 * dataset.
 */
export const requestSpreadsheet = () => ({
    type: REQUEST_SPREADSHEET_DATA
})

/**
 * Set busy flag during spreadsheet update. Will not invalidate the current
 * dataset.
 */
export const requestSpreadsheetUpdate = () => ({
    type: REQUEST_SPREADSHEET_UPDATE
})

/**
 * Signal error while fetching a spreadsheet
 */
export const spreadsheetFetchError = (message) => ({
    type: SPREADSHEET_ERROR,
    error: {
        title: 'Error while fetching data',
        message
    }
})

/**
 * Signal error during spreadsheet update operation.
 */
export const spreadsheetOperationError = (message) => ({
    type: SPREADSHEET_OPERATION_ERROR,
    error: {
        title: 'Error while updating dataset',
        message
    }
})

/**
 * Post a vizual operation to update the current spreadsheet. On success, try
 * to reload the updated dataset (note that the dataset Url may have changed)
 */
export const updateSpreadsheet = (url, op, dataset) => (dispatch) => {
    return postResourceData(
        dispatch,
        url,
        op,
        (json) => {
            const workflow = new WorkflowHandle(json)
            // On success try to reload the current dataset and update the
            // current workflow handle
            if (!workflow.hasError()) {
                const datasets = workflow.datasets
                for (let i = 0; i < datasets.length; i++) {
                    const ds = datasets[i]
                    if (ds.name === dataset) {
                        dispatch(fetchSpreadsheet(ds.links.annotated, dataset))
                    }
                }
            } else {
                dispatch(showNotebookView())
            }
            return receiveWorkflow(workflow)
        },
        spreadsheetOperationError,
        requestSpreadsheetUpdate
    )
}
