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

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { fetchService, receiveAuth } from '../../actions/main/Service'
import ContentSpinner from '../../components/ContentSpinner';
import { ErrorMessage } from '../../components/Message';
import MainPage from './MainPage'
import ProjectPage from '../project/ProjectPage'
import AuthModal from '../../components/modals/AuthModal';

import { baseHref, projectHref, isNotEmptyString } from '../../util/App';

import logo from '../../../img/logo_small.png';
import '../../../css/App.css'

import { MODAL_AUTH } from '../../actions/main/Service'

class App extends Component {
    static propTypes = {
        error: PropTypes.string,
        isFetching: PropTypes.bool.isRequired,
        serviceUrl: PropTypes.string,
        showModal: PropTypes.string,
        refetch: PropTypes.bool
    }
    constructor(props) {
        super(props);
        this.state = {showModal: null}
        const { dispatch } = this.props
        dispatch(fetchService());
    }
    /**
     * Show modal to login.
     */
    showAuthModal = () => (this.setState({showModal: MODAL_AUTH}));

    /**
     * Hide any open modal.
     */
    hideModal = () => (this.setState({showModal: null}));

    /**
     * Called by auth modal on submit.
     */
    authComplete = (user) => {
    	const { dispatch } = this.props
    	localStorage.setItem('user', JSON.stringify(user));
        dispatch(receiveAuth(user.authdata))
    }
    /**
     * reload the service descriptor.
     */
    refetchService() {
        const { dispatch } = this.props
        dispatch(fetchService())
    }
    /**
     * Create the page header and the routing elements in the DOM.
     */
    render() {
        // Set the window title
        if (window.env.APP_TITLE) {
            document.title = 'Vizier DB - ' + window.env.APP_TITLE
        } else {
            document.title = 'Vizier DB'
        }
        const { isFetching, error, showModal, refetch } = this.props;
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
        } else if(refetch){
        	this.refetchService();
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
        const modals = (
                <div>
                    <AuthModal
                        isValid={isNotEmptyString}
                        open={showModal === MODAL_AUTH}
                        prompt='Please enter your login credentials'
                        title='Login'
                        onCancel={this.hideModal}
                    	onSubmit={this.authComplete}
                        value=''
                     />
                </div>
               );
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
                    { modals }
                </div>
          </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        error: state.serviceApi.error,
        isFetching: state.serviceApi.isFetching,
        serviceUrl: state.serviceApi.serviceUrl,
        showModal: state.serviceApi.showModal,
        refetch: state.serviceApi.refetch
    }
}

export default connect(mapStateToProps)(App);
