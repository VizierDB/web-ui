/**
* Reducer for spreadsheet view of a dataset.
*/

import {
    RECEIVE_SPREADSHEET_DATA, REQUEST_SPREADSHEET_DATA,
    REQUEST_SPREADSHEET_UPDATE, SPREADSHEET_ERROR, SPREADSHEET_OPERATION_ERROR
} from '../../actions/spreadsheet/Spreadsheet'
import { DatasetHandle } from '../../util/Api'


/**
 * STATE:
 *
 * dataset: Dataset object with columns and rows
 * error: Error while fetching or updating the spreadsheet
 * isBusy: Flag indicating whether fetching or updating is in progress
 * workflow: Workflow with which the dataset is associated
 */

const INITIAL_STATE = {
    dataset: null,
    error: null,
    isBusy: false,
    opError: null,
    workflow: null
}

export const spreadsheet = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case REQUEST_SPREADSHEET_DATA:
            return {
                ...state,
                dataset: null,
                error: null,
                opError: null,
                isBusy: true
            }
        case REQUEST_SPREADSHEET_UPDATE:
            return {
                ...state,
                error: null,
                opError: null,
                isBusy: true
            }
        case SPREADSHEET_ERROR:
            return {
                ...state,
                error: action.error,
                opError: null,
                isBusy: false
            }
        case SPREADSHEET_OPERATION_ERROR:
            return {
                ...state,
                error: null,
                opError: action.error,
                isBusy: false
            }
        case RECEIVE_SPREADSHEET_DATA:
            return {
                ...state,
                dataset: new DatasetHandle(action.dataset, action.name),
                error: null,
                opError: null,
                isBusy: false
            }
        default:
            return state
    }
}
