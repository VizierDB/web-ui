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

//add analytics
const injectOWA = () => {
	if (typeof window == 'undefined') {
		return;
	}
	window._owa = document.createElement('script');                      
    window._owa.type = 'text/javascript';                                                                 
    window._owa.async = true;
    window._owa.src = 'https://analytics.vizier.app/modules/base/js/owa.tracker-combined-min.js';
    window._owa_s = document.getElementsByTagName('script')[0];
    window._owa_s.parentNode.insertBefore(window._owa, window._owa_s);
	
    window.owa_baseUrl = 'https://analytics.vizier.app/';
	window.owa_cmds = window.owa_cmds || [];
	function owatag() {
		window.owa_cmds.push(arguments);
	}
	//owatag('js', new Date());
	owatag('setSiteId', '805ffb2592b7e9dc85bb1ba24f4ce924');
	owatag('trackPageView');
	owatag('trackClicks');
};

render(
	<Provider store={store}>
        <ConnectedRouter history={history}>
            <App>
                <script>{injectOWA()}</script>
            </App>
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
)
