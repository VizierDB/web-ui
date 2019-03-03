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

import { RECEIVE_BRANCH_HISTORY, REQUEST_BRANCH } from '../../actions/project/Branch';
import { PROJECT_FETCH_ERROR, RECEIVE_PROJECT, REQUEST_PROJECT } from '../../actions/project/Project';

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

export const branchPage = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case PROJECT_FETCH_ERROR:
            return {
                ...state,
                isFetching: false,
                fetchError: action.error
            };
        case RECEIVE_BRANCH_HISTORY:
            return {
                ...state,
                workflows: action.workflows,
                isFetching: false,
                fetchError: null
            };
        case RECEIVE_PROJECT:
            return {...state, workflows: null};
        case REQUEST_PROJECT:
        case REQUEST_BRANCH:
            return {
                ...state,
                isFetching: true,
            };
        default:
            return state
    }
}
