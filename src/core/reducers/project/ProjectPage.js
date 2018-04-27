/**
 * Reducer for actions that retrieve the Vizier DB Web Service API descriptor.
 */

import {
  PROJECT_ACTION_ERROR, PROJECT_FETCH_ERROR, RECEIVE_PROJECT,
  RECEIVE_PROJECT_RESOURCE, REQUEST_PROJECT, REQUEST_PROJECT_ACTION,
  UPDATE_BRANCH, UPDATE_PROJECT, UPDATE_RESOURCE, UPDATE_WORKFLOW
} from '../../actions/project/ProjectPage'


/**
 * STATE:
 *
 * actionError: Error while loading or updating a project resource
 * fetchError: Error while loading the project handle
 * isActive: Loading or updating a project resource is in progress
 * isFetching: Load of project handle in progress
 * project: The project handle
 * resource: A project resource object that has been loaded
 * workflow: Workflow handle
 */

const INITIAL_STATE = {
    actionError: null,
    fetchError: null,
    isActive: false,
    isFetching: false,
    project: null,
    resource: null,
    workflow: null
}

export const projectPage = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case REQUEST_PROJECT:
            return {
                ...state,
                isFetching: true,
            };
        case REQUEST_PROJECT_ACTION:
            return {
                ...state,
                isActive: true
            };
        case PROJECT_FETCH_ERROR:
            return {
                ...state,
                isFetching: false,
                fetchError: action.error
            };
        case PROJECT_ACTION_ERROR:
            return {
                ...state,
                isActive: false,
                isFetching: false,
                actionError: action.error
            };
        case RECEIVE_PROJECT:
            return {
                ...state,
                actionError: null,
                fetchError: null,
                isActive: false,
                isFetching: false,
                project: action.project,
                resource: null,
                workflow: action.workflow

            };
        case RECEIVE_PROJECT_RESOURCE:
            return {
                ...state,
                actionError: null,
                isActive: false,
                resource: action.resource

            };
        case UPDATE_BRANCH:
            return {
                ...state,
                actionError: null,
                isActive: false,
                project: action.project,
                workflow: action.workflow
            };
        case UPDATE_PROJECT:
            return {
                ...state,
                actionError: null,
                isActive: false,
                project: action.project
            };
        case UPDATE_RESOURCE:
            return {
                ...state,
                actionError: null,
                isActive: false,
                resource: action.resource
            };
        case UPDATE_WORKFLOW:
            return {
                ...state,
                actionError: null,
                isActive: false,
                resource: action.resource,
                workflow: action.workflow
            };
        default:
            return state
    }
}
