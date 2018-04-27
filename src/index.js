import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { ConnectedRouter, routerMiddleware } from 'react-router-redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import createHistory from 'history/createBrowserHistory'
import reducer from './core/reducers'
import App from './core/containers/main/App'
import 'semantic-ui-css/semantic.min.css';
import './css/index.css';

// Most of the initialization code has been copied from the following article:
// https://medium.com/@notrab/getting-started-with-create-react-app-redux-react-router-redux-thunk-d6a19259f71f

// History syncs browserHistory with our store
export const history = createHistory()

const enhancers = []
const middleware = [
    thunk,
    routerMiddleware(history)
]

if (process.env.NODE_ENV !== 'production') {
    middleware.push(createLogger())
    const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__
    if (typeof devToolsExtension === 'function') {
        enhancers.push(devToolsExtension())
    }
}

const composedEnhancers = compose(
    applyMiddleware(...middleware),
    ...enhancers
)

// Initialize the object (store) that holds the application state tree. The
// required components of the serviceApi are set here. In particular, the
// Url of the Vizier DB Web API. The API is expected to be contained in a file
// env.js in the public directory (following the suggestion from
// https://github.com/facebookincubator/create-react-app/issues/578)
export const store = createStore(
    reducer,
    {
        serviceApi: {
            isFetching: false,
            serviceUrl: window.env.API_URL
        }
    },
    composedEnhancers
)

render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <App />
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
)
