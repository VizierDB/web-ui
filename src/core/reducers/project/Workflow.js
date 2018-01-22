
import {
    FETCH_WORKFLOW_ERROR, RECEIVE_WORKFLOW, REQUEST_WORKFLOW
} from '../../actions/project/Workflow'


const INITIAL_STATE = {
    dataset: null,
    fetchError: null,
    isFetching: false,
    workflow: null
}

export const workflow = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FETCH_WORKFLOW_ERROR:
            return {...state, isFetching: false, fetchError: action.error}
        case RECEIVE_WORKFLOW:
            return {
                ...state,
                isFetching: false,
                workflow: action.workflow
            }
        case REQUEST_WORKFLOW:
            return {
                ...state,
                commands: null,
                isFetching: true,
                fetchError: null,
                workflow: null
            }
        default:
            return state
    }
}
