import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { connect } from 'react-redux'
import { fetchService } from '../../actions/main/Service'
import { ContentSpinner } from '../../components/util/Spinner'
import { ErrorMessage } from '../../components/util/Message';
import { ConnectionInfo } from '../../components/util/Api'
import MainPage from './MainPage'
import ProjectPage from '../project/ProjectPage'

import logo from '../../../img/logo_small.png';
import '../../../css/App.css'

/**
 * Set application routes. The baseHref points to the application home. Route
 * projectHref points to the web page for individual projects.
 */
let href = '';
if (process.env.NODE_ENV === 'production') {
    href = href + 'vizier-db';
}
export const baseHref = '/' + href;
export const projectHref = baseHref + 'projects/:project_id';


class App extends Component {
    static propTypes = {
        engines: PropTypes.array,
        error: PropTypes.string,
        isFetching: PropTypes.bool.isRequired,
        links: PropTypes.object,
        name: PropTypes.string,
        serviceUrl: PropTypes.string
    }

    /**
     * Load the service descriptor when the App starts.
     */
    componentDidMount() {
        const { dispatch } = this.props
        dispatch(fetchService())
    }

    render() {
        // Set the window title
        if (window.env.APP_TITLE) {
            document.title = 'Vizier DB - ' + window.env.APP_TITLE
        } else {
            document.title = 'Vizier DB'
        }
        const { isFetching, error, name } = this.props;
        let content = null;
        let connection = null;
        if (isFetching) {
            content = (<ContentSpinner />)
        } else if (error) {
            let title = 'Error while loading service descriptor'
            if (this.props.serviceUrl) {
                title = title + ' @ ' + this.props.serviceUrl
            }
            content = (<ErrorMessage
                title={title}
                message={error}
            />);
        } else {
            content = (
                <Router>
                    <div>
                        <Route exact path={baseHref} component={MainPage} />
                        <Route path={projectHref} component={ProjectPage} />
                    </div>
                </Router>
            );
            if (name) {
                connection = (<ConnectionInfo api={this.props}/>)
            }
        }
        return (
            <div className="app">
                <div className="app-header">
                  <img src={logo} className="app-logo" alt="logo" />
                  <span className="app-name">
                      <a href={baseHref} className="home-link">vizier db</a>
                      <span className="app-title">streamlined data curation</span>
                  </span>
                </div>
                <div className="main-content">
                    { content }
                    { connection }
                </div>
          </div>
        );
    }
}

const mapStateToProps = state => {

    return {
        error: state.serviceApi.error,
        isFetching: state.serviceApi.isFetching,
        name: state.serviceApi.name,
        engines: state.serviceApi.engines,
        links: state.serviceApi.links,
        serviceUrl: state.serviceApi.serviceUrl
    }
}

export default connect(mapStateToProps)(App)
