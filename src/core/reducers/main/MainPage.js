/**
 * Reducer for actions that manipulate the global state of the App home page.
 */

import { SET_ACTIVE_ITEM } from '../../actions/main/MainPage'
import { MENU_ITEM_PROJECTS } from '../../containers/main/MainPage'

/**
 * STATE:
 *
 * activeItem: name of the selected menu item
 */

const INITIAL_STATE = {
    activeItem: MENU_ITEM_PROJECTS
}

export const mainPage = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_ACTIVE_ITEM:
        return {
          ...state,
          activeItem: action.item
        }
    default:
      return state
  }
}
