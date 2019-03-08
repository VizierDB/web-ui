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
  CLEAR_PROJECT_ACTION_ERROR, REQUEST_PROJECTS, RECEIVE_PROJECTS,
  SET_PROJECT_CREATE_ERROR, SET_PROJECT_DELETE_ERROR, SET_PROJECTS_FETCH_ERROR
} from '../../actions/project/ProjectListing'
import { ErrorObject } from '../../util/Error';


/**
* Reducer for actions that retrieve the Vizier DB Web Service API descriptor.
*/


const DEFAULT_FETCH_MESSAGE = 'Loading Projects ...';


/**
 * STATE:
 *
 * deleteError: Error while deleting a project
 * fetchError: Error while fetching project listing
 * isFetchig: Flag indicating whether fetching is in progress
 * projects: List of retrieved project resources.
 * links: HATEOASReferences
 */

const INITIAL_STATE = {
    actionError: null,
    fetchError: null,
    fetchMessage: DEFAULT_FETCH_MESSAGE,
    isFetching: false,
    projects: null,
    links: null
}


export const projectListing = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case CLEAR_PROJECT_ACTION_ERROR:
            return {...state, actionError: null};
        case REQUEST_PROJECTS:
            let message = DEFAULT_FETCH_MESSAGE;
            if (action.message != null) {
                message = action.message;
            }
            return {
                ...state,
                isFetching: true,
                fetchMessage: message
            }
        case RECEIVE_PROJECTS:
            return {
                ...state,
                fetchError: null,
                isFetching: false,
                projects: action.projects,
                links: action.links
            }
        case SET_PROJECT_CREATE_ERROR:
            return {
                ...state,
                isFetching: false,
                actionError: new ErrorObject('Error creating project', action.error)
            }
        case SET_PROJECT_DELETE_ERROR:
            return {
                ...state,
                isFetching: false,
                actionError: new ErrorObject('Error deleting project', action.error)
            }
        case SET_PROJECTS_FETCH_ERROR:
            return {
                ...state,
                isFetching: false,
                fetchError: action.error,
                projects: []
            }
    default:
      return state
  }
}
