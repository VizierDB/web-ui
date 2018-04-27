/**
 * Reducer for actions that manipulate the global state of the App home page.
 */

import { SET_ACTIVE_ITEM } from '../../actions/main/MainPage'
import { RECEIVE_SERVICE } from '../../actions/main/Service'
import { MENU_ITEM_HOME } from '../../containers/main/MainPage'

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
