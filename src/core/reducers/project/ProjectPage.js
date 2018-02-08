/**
 * Reducer for actions that retrieve the Vizier DB Web Service API descriptor.
 */

import { RECEIVE_FILES } from '../../actions/fileserver/Fileserver'
import {
  REQUEST_PROJECT, RECEIVE_MODULE_REGISTRY, RECEIVE_PROJECT,
  SET_PROJECT_FETCH_ERROR
} from '../../actions/project/ProjectPage'
import {
    HATEOASReferences, getProperty
} from '../../util/Api'
import { UTC2LocalTime } from '../../util/Timestamp';


/**
 * STATE:
 *
 * error: Error while fetching the project
 * isFetchig: Flag indicating whether fetching is in progress
 * project: Retrieved project resource
 */

const INITIAL_STATE = {
    moduleRegistry: null,
    error: null,
    files: [],
    isFetching: false,
    project: null
}

export const projectPage = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case REQUEST_PROJECT:
            return {
                ...state,
                isFetching: true
            }
        case RECEIVE_MODULE_REGISTRY:
            return {
                ...state,
                moduleRegistry: action.moduleRegistry
            }
        case RECEIVE_FILES:
            return {...state, files: action.files}
        case RECEIVE_PROJECT:
            const prj = action.project
            let project = null;
            if (prj !== null) {
                project = {
                    id: prj.id,
                    name: getProperty(prj, 'name', 'undefined'),
                    createdAt: UTC2LocalTime(prj.createdAt),
                    lastModifiedAt: UTC2LocalTime(prj.lastModifiedAt),
                    links: new HATEOASReferences(prj.links)
                }
            }
            return {
                ...state,
                error: null,
                isFetching: false,
                project: project
            }
        case SET_PROJECT_FETCH_ERROR:
            return {
                ...state,
                isFetching: false,
                error: action.error
            }
    default:
      return state
  }
}
