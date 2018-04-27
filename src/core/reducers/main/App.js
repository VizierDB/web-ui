/**
 * This is a temporary hack until the router redirect is working
 */

import { REDIRECT_TO } from '../../actions/main/App'

export const app = (state = {}, action) => {
    switch (action.type) {
        case REDIRECT_TO:
            window.location.href = action.url;
            return state;
        default:
            return state
    }
}
