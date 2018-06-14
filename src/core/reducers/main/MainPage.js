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

import { SET_ACTIVE_ITEM } from '../../actions/main/MainPage'
import { RECEIVE_SERVICE } from '../../actions/main/Service'
import { MENU_ITEM_HOME } from '../../containers/main/MainPage'

/**
* Reducer for actions that manipulate the global state of the App home page.
*/

/**
 * STATE:
 *
 * activeItem: name of the selected menu item
 */

const INITIAL_STATE = {
    activeItem: MENU_ITEM_HOME,
    homePageContent: null
}

export const mainPage = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case SET_ACTIVE_ITEM:
            return {
                ...state,
                activeItem: action.item
            }
        case RECEIVE_SERVICE:
            return {
                ...state,
                homePageContent: action.welcome
            }
        default:
            return state
    }
}
