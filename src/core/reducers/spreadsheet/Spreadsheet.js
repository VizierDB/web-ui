/**
* Reducer for spreadsheet.
*/

import {
    PROJECT_ACTION_ERROR, RECEIVE_PROJECT_RESOURCE, UPDATE_WORKFLOW
} from '../../actions/project/ProjectPage';
import { SUBMIT_UPDATE_REQUEST } from '../../actions/spreadsheet/Spreadsheet';

/**
 * STATE:
 *
 * dataset: DatasetHandle
 * isUpdating: Flag indicating whether update is in progress
 * opError: ErrorObject in case of an update error
 */

const INITIAL_STATE = {
    dataset: null,
    isUpdating: false
}


export const spreadsheet = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case RECEIVE_PROJECT_RESOURCE:
        case UPDATE_WORKFLOW:
            const resource = action.resource;
            if (resource != null) {
                if (resource.isDataset()) {
                    return {
                        ...state,
                        dataset: resource.content,
                        isUpdating: false
                    }
                }
            }
            return state;
        case PROJECT_ACTION_ERROR:
        return {...state, isUpdating: false};
        case SUBMIT_UPDATE_REQUEST:
            return {...state, isUpdating: true};
        default:
            return state
    }
}
