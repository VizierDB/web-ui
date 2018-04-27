/**
 * Reducer for actions that retrieve the Vizier DB Web Service API descriptor.
 */

import {
  REQUEST_PROJECTS, RECEIVE_PROJECTS,
  SET_PROJECT_DELETE_ERROR, SET_PROJECT_EDIT_ERROR_LISTING,
  SET_PROJECTS_FETCH_ERROR
} from '../../actions/project/ProjectListing'
import { RECEIVE_SERVICE } from '../../actions/main/Service'
import { getProperty } from '../../util/Api'
import { HATEOASReferences } from '../../util/HATEOAS';
import { utc2LocalTime } from '../../util/Timestamp';


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
    deleteError: null,
    editError: null,
    envs: null,
    fetchError: null,
    isFetching: false,
    projects: [],
    links: null
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
    return result;
}

export const projectListing = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case REQUEST_PROJECTS:
            return {
                ...state,
                isFetching: true
            }
        case RECEIVE_PROJECTS:
            return {
                ...state,
                deleteError: null,
                editError: null,
                fetchError: null,
                isFetching: false,
                projects: listProjects(action.projects),
                links: new HATEOASReferences(action.links)
            }
        case RECEIVE_SERVICE:
            return {...state, envs: action.envs}
        case SET_PROJECT_DELETE_ERROR:
            return {
                ...state,
                isFetching: false,
                deleteError: action.error
            }
        case SET_PROJECT_EDIT_ERROR_LISTING:
            return {
                ...state,
                isFetching: false,
                editError: action.error
            }
        case SET_PROJECTS_FETCH_ERROR:
            return {
                ...state,
                isFetching: false,
                fetchError: action.error
            }
    default:
      return state
  }
}
