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

import {
    PROJECT_ACTION_ERROR, RECEIVE_PROJECT_RESOURCE, UPDATE_WORKFLOW
} from '../../actions/project/Project';
import {
    SET_ANNOTATIONS, SUBMIT_UPDATE_REQUEST, UPDATE_DATASET_ANNOTATIONS
} from '../../actions/project/Spreadsheet';
import { NoAnnotation } from '../../resources/Annotation';

/**
* Reducer for spreadsheet.
*/


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
