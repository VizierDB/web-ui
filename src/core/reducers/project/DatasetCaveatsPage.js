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

import { REQUEST_CAVEATS } from '../../actions/project/Spreadsheet';
import { PROJECT_FETCH_ERROR, RECEIVE_PROJECT, REQUEST_PROJECT, RECEIVE_PROJECT_RESOURCE } from '../../actions/project/Project';
import { RESOURCE_DATASET_CAVEAT } from '../../util/App';
import { CONTENT_DATASET } from '../../resources/Outputs';

/**
* Reducer for actions that affect the branch history page.
*/


/**
 * STATE:
 *
 * fetchError: Error while loading the project handle or workflow listing
 * isFetching: Load of project handle or workflow listing in progress
 * workflows: List of workflow descriptors in branch history
 */

const INITIAL_STATE = {
    fetchError: null,
    isFetching: false,
    workflows: null
}

export const datasetErrorsPage = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case PROJECT_FETCH_ERROR:
            return {
                ...state,
                isFetching: false,
                fetchError: action.error
            };
        case RECEIVE_PROJECT:
            return {...state, workflows: null};
        case REQUEST_PROJECT:
        case REQUEST_CAVEATS:
            return {
                ...state,
                isFetching: true,
            };
        case RECEIVE_PROJECT_RESOURCE:
        	switch (action.resource.type) {
        		case RESOURCE_DATASET_CAVEAT:
	        	    return {
		        	    ...state,
		        	    isFetching: false,
		                resource: action.resource
		            };
        		case CONTENT_DATASET:
	        	    return {
		        	    ...state,
		        	    dataset: action.resource
		            };
        		default:
                    return state
        	}
        default:
            return state
    }
}
