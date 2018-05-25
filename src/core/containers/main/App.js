import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux'
import { fetchService } from '../../actions/main/Service'
import ContentSpinner from '../../components/ContentSpinner';
import { ErrorMessage } from '../../components/Message';
import MainPage from './MainPage'
import ProjectPage from '../project/ProjectPage'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import { baseHref, projectHref } from '../../util/App';

import logo from '../../../img/logo_small.png';
import '../../../css/App.css'


class App extends Component {
    static propTypes = {
        error: PropTypes.string,
        isFetching: PropTypes.bool.isRequired,
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
        const { isFetching, error } = this.props;
        let content = null;
        let connection = null;
        if (isFetching) {
            content = <ContentSpinner />;
        } else if (error) {
            let title = 'Error while loading service descriptor'
            if (this.props.serviceUrl) {
                title = title + ' @ ' + this.props.serviceUrl
            }
            content = (
                <div className='page-content slim'>
                    <ErrorMessage
                        title={title}
                        message={error}
                        />
                </div>
            );
        } else {
            content = (
                <MuiThemeProvider>
                    <Router>
                        <Switch>
                            <Route exact path={baseHref} component={MainPage} />
                            <Route path={projectHref} component={ProjectPage} />
                        </Switch>
                    </Router>
                </MuiThemeProvider>
            );
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
        serviceUrl: state.serviceApi.serviceUrl
    }
}

export default connect(mapStateToProps)(App)
