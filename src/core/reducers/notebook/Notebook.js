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
    RECEIVE_PROJECT_RESOURCE, UPDATE_RESOURCE, UPDATE_WORKFLOW
} from '../../actions/project/Project';

/**
* Reducer for notebook. Keeps track of the notebook itself and the cell order.
*/


/**
 * STATE:
 *
 * activeCell: Identifier of the active cell
 * notebook: Notebook
 *
 */
const INITIAL_STATE = {
    activeCell: null,
    notebook: null
}

export const notebook = (state = INITIAL_STATE, action) => {
    switch (action.type) {
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
