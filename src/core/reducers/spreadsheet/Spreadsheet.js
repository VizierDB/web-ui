/**
* Reducer for spreadsheet.
*/

import {
    PROJECT_ACTION_ERROR, RECEIVE_PROJECT_RESOURCE, UPDATE_WORKFLOW
} from '../../actions/project/ProjectPage';
import {
    SET_ANNOTATIONS, SUBMIT_UPDATE_REQUEST, UPDATE_DATASET_ANNOTATIONS
} from '../../actions/spreadsheet/Spreadsheet';
import { NoAnnotation } from '../../resources/Annotation';


/**
 * STATE:
 *
 * annotations: CellAnnotations for a dataset cell
 * dataset: DatasetHandle
 * isUpdating: Flag indicating whether update is in progress
 * opError: ErrorObject in case of an update error
 */

const INITIAL_STATE = {
    annotations: new NoAnnotation(),
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
                        annotations: new NoAnnotation(),
                        isUpdating: false
                    }
                }
            }
            return state;
        case PROJECT_ACTION_ERROR:
            return {...state, isUpdating: false};
        case SET_ANNOTATIONS:
            return {...state, annotations: action.annotations};
        case SUBMIT_UPDATE_REQUEST:
            return {...state, isUpdating: true};
        case UPDATE_DATASET_ANNOTATIONS:
            return {...state, dataset: action.dataset};
        default:
            return state
    }
}
