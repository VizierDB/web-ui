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
    PROJECT_SUBMITTING, SET_PROJECT_CREATE_ERROR
} from '../../actions/project/ProjectListing'

/**
* Reducer for actions that create a new data curation project.
*/


/**
 * STATE:
 *
 * error: Error message that was generated during a HTTP POST request
 * isSubmitting: Flag indicating whether HTTP POST request has been submitted
 */

const INITIAL_STATE = {
    error: null,
    isSubmitting: false
}

export const projectCreate = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case PROJECT_SUBMITTING:
            return {
                ...state,
                isSubmitting: action.flag
            }
        case SET_PROJECT_CREATE_ERROR:
            return {
                ...state,
                isSubmitting: false,
                error: action.error
            }
        default:
            return state
  }
}
