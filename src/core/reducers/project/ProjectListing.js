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
  SET_PROJECT_CREATE_ERROR, SET_PROJECT_DELETE_ERROR, SET_PROJECTS_FETCH_ERROR,
  TOGGLE_SHOW_PROJECT_FORM
} from '../../actions/project/ProjectListing'
import { RECEIVE_SERVICE } from '../../actions/main/Service'
import { getProperty } from '../../util/Api';
import { ErrorObject } from '../../util/Error';
import { HATEOASReferences } from '../../util/HATEOAS';
import { utc2LocalTime } from '../../util/Timestamp';

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
 * showForm: Flagindicating whether the 'New Project ...' form is visible
 */

const INITIAL_STATE = {
    actionError: null,
    envs: null,
    fetchError: null,
    fetchMessage: DEFAULT_FETCH_MESSAGE,
    isFetching: false,
    projects: [],
    links: null,
    showForm: false
}

/**
 * Convert the list of projects returned by the API into a list of objects that
 * contain id, name, createdAt, lastModifiedAt, and a HATEOASReferences object.
 */
const listProjects = (projects) => {
    let result = [];
    for (let i = 0; i < projects.length; i++) {
        const prj = projects[i]
        result.push({
            id: prj.id,
            name: getProperty(prj, 'name', 'undefined'),
            envId: prj.environment,
            createdAt: utc2LocalTime(prj.createdAt),
            lastModifiedAt: utc2LocalTime(prj.lastModifiedAt),
            links: new HATEOASReferences(prj.links)
        })
    }
    result.sort(function(p1, p2) {return p1.name.localeCompare(p2.name)});
    return result;
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
                actionError: null,
                fetchError: null,
                isFetching: false,
                projects: listProjects(action.projects),
                links: new HATEOASReferences(action.links)
            }
        case RECEIVE_SERVICE:
            return {...state, envs: action.envs}
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
        case TOGGLE_SHOW_PROJECT_FORM:
            let visibility = !state.showForm;
            if (action.value != null) {
                visibility = action.value;
            }
            return {...state, showForm: visibility}
    default:
      return state
  }
}
