import { receiveWorkflow } from '../project/Workflow'
import { fetchResource, WorkflowHandle } from '../../util/Api'
import { ErrorObject } from '../../util/Error'

export const CLEAR_NOTEBOOKCELL_DATASET = 'CLEAR_NOTEBOOKCELL_DATASET'
export const FETCH_NOTEBOOKCELL_CHART_ERROR = 'FETCH_NOTEBOOKCELL_CHART_ERROR'
export const FETCH_NOTEBOOKCELL_DATASET_ERROR = 'FETCH_NOTEBOOKCELL_DATASET_ERROR'
export const RECEIVE_NOTEBOOKCELL_CHART = 'RECEIVE_NOTEBOOKCELL_CHART'
export const RECEIVE_NOTEBOOKCELL_DATASET = 'RECEIVE_NOTEBOOKCELL_DATASET'
export const REQUEST_NOTEBOOKCELL_CHART = 'REQUEST_NOTEBOOKCELL_CHART'
export const REQUEST_NOTEBOOKCELL_DATASET = 'REQUEST_NOTEBOOKCELL_DATASET'
export const REVERSE_NOTEBOOKCELLS = 'REVERSE_NOTEBOOKCELLS'
export const SET_NOTEBOOKCELL_BUSY = 'SET_NOTEBOOKCELL_BUSY'
export const SET_NOTEBOOKCELL_ERROR = 'SET_NOTEBOOKCELL_ERROR'

/**
 * Clear any dataset information that is currently part of the notebook cell's
 * output.
 */
export const clearNotebookCellDataset = (index) =>  ({
    type: CLEAR_NOTEBOOKCELL_DATASET,
    index
})

/**
 * Delete a module in an existing workflow.
 */
export const deleteWorkflowModule = (index, url) => (dispatch) => {
    // Signal start by setting the isBusy flag of the cell
    dispatch(setCellBusyFlag(index))
    return fetch(url, {method: 'DELETE'})
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status === 200) {
                // SUCCESS: Dispatch modified workflow handle
                response.json().then(json => dispatch(receiveWorkflow(new WorkflowHandle(json))));
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                response.json().then(json => dispatch(
                    setCellErrorMessage(
                        index,
                        new ErrorObject(
                            'Error while deleting module',
                            json.message
                        )
                    )
                ))
            }
        })
        .catch(err => dispatch(
            setCellErrorMessage(
                index,
                new ErrorObject(
                    'Error while deleting module',
                    err.message
                )
            )
        ))
}

/**
 * Insert a new module into an existing workflow.
 */
export const insertWorkflowModule = (index, url, data) => (dispatch) => {
    // Signal start by setting the isBusy flag of the cell
    dispatch(setCellBusyFlag(index))
    return fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
        })
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status === 200) {
                // SUCCESS: Dispatch modified workflow handle
                response.json().then(json => dispatch(receiveWorkflow(new WorkflowHandle(json))));
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                response.json().then(json => dispatch(
                    setCellErrorMessage(
                        index,
                        new ErrorObject(
                            'Error while inserting new module',
                            json.message
                        )
                    )
                ));
            }
        })
        .catch(err => dispatch(
            setCellErrorMessage(
                index,
                new ErrorObject(
                    'Error while inserting new module',
                    err.message
                )
            )
        ))
}

/**
 * Fetch a dataset chart view for a notebook cell.
 */
export const loadNotebookCellChart = (index, url) => (dispatch) => {
    dispatch(
        fetchResource(
            url,
            (data) => ({
                type: RECEIVE_NOTEBOOKCELL_CHART,
                index,
                data
            }),
            (message) => ({
                type: FETCH_NOTEBOOKCELL_CHART_ERROR,
                index,
                message
            }),
            () => ({
                type: REQUEST_NOTEBOOKCELL_CHART,
                index
            })
        )
    )
}

/**
 * Fetch a dataset as part of a notebook cell's output
 */
export const loadNotebookCellDataset = (index, url) => (dispatch) => {
    dispatch(
        fetchResource(
            url,
            (dataset) => ({
                type: RECEIVE_NOTEBOOKCELL_DATASET,
                index,
                dataset
            }),
            (message) => ({
                type: FETCH_NOTEBOOKCELL_DATASET_ERROR,
                index,
                message
            }),
            () => ({
                type: REQUEST_NOTEBOOKCELL_DATASET,
                index
            })
        )
    )
}

/**
 * Replace a module in an existing workflow.
 */
export const replaceWorkflowModule = (index, url, data) => (dispatch) => {
    // Signal start by setting the isBusy flag of the cell
    dispatch(setCellBusyFlag(index))
    return fetch(url, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
        })
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status === 200) {
                // SUCCESS: Dispatch modified workflow handle
                response.json().then(json => dispatch(receiveWorkflow(new WorkflowHandle(json))));
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                response.json().then(json => dispatch(
                    setCellErrorMessage(
                        index,
                        new ErrorObject(
                            'Error while replacing module',
                            json.message
                        )
                    )
                ));
            }
        })
        .catch(err => dispatch(
            setCellErrorMessage(
                index,
                new ErrorObject(
                    'Error while replacing module',
                    err.message
                )
            )
        ))
}

/**
 * Reverse ordering of notebook cells.
 */
export const reverseNotebbokCells = () => ({
    type: REVERSE_NOTEBOOKCELLS
})

/**
 * Set the isBusy flag for a given notebook cell.
 */
export const setCellBusyFlag = (index) => ({
    type: SET_NOTEBOOKCELL_BUSY,
    index
})

/**
 * Set the error object for a given notebook cell.
 */
export const setCellErrorMessage = (index, error) => ({
    type: SET_NOTEBOOKCELL_ERROR,
    index,
    error
})
