import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { createLogger } from 'redux-logger'
import reducer from './core/reducers'
import App from './core/containers/main/App'
import 'semantic-ui-css/semantic.min.css';
import './css/index.css';

const middleware = [ thunk ]
if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger())
}

// Initialize the object (store) that holds the application state tree. The
// required components of the serviceApi are set here. In particular, the
// Url of the Vizier DB Web API. The API is expected to be contained in a file
// env.js in the public directory (following the suggestion from
// https://github.com/facebookincubator/create-react-app/issues/578)
const store = createStore(
  reducer,
  {
      serviceApi: {
          isFetching: false,
          serviceUrl: window.env.API_URL
      }
  },
  applyMiddleware(...middleware)
)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
