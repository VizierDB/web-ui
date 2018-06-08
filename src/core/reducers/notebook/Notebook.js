/**
* Reducer for notebook. Keeps track of the notebook itself and the cell order.
*/

import { CHANGE_GROUP_MODE, REVERSE_ORDER } from '../../actions/notebook/Notebook';
import {
    RECEIVE_PROJECT_RESOURCE, UPDATE_RESOURCE, UPDATE_WORKFLOW
} from '../../actions/project/ProjectPage';
import { GRP_HIDE } from '../../resources/Notebook';


/**
 * STATE:
 *
 * grouped: Flag indicating whether consecutive VizUAL commands are grouped in
 *     a single cell.
 * notebook: Notebook
 * reversed: Flag indicating whether cells are shown in reveresed order
 */

const INITIAL_STATE = {
    groupMode: GRP_HIDE,
    notebook: null,
    reversed: false
}

export const notebook = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case CHANGE_GROUP_MODE:
            return {
                ...state,
                groupMode: action.mode
            }
        case RECEIVE_PROJECT_RESOURCE:
        case UPDATE_RESOURCE:
        case UPDATE_WORKFLOW:
            const resource = action.resource;
            if (resource != null) {
                if (resource.isNotebook()) {
                    return {
                        ...state,
                        notebook: resource.content
                    }
                }
            }
            return state;
        case REVERSE_ORDER:
            return {
                ...state,
                reversed: !state.reversed
            }
        default:
            return state
    }
}
