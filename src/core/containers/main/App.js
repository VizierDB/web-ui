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
import { withRouter } from 'react-router-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { fetchService, receiveAuth } from '../../actions/main/Service'
import { ConnectionInfo } from '../../components/Api';
import ContentSpinner from '../../components/ContentSpinner';
import { ErrorMessage } from '../../components/Message';
import MainPage from './MainPage'
import BranchPage from '../project/BranchPage';
import NotebookPage from '../project/NotebookPage'
import SpreadsheetPage from '../project/SpreadsheetPage'
import DatasetCaveatsPage from '../project/DatasetCaveatsPage'
import AuthModal from '../../components/modals/AuthModal';
import {
    baseHref, branchHistoryHref, notebookHeadHref, notebookVersionHref,
    isNotEmptyString, spreadsheetHref, errorListHref, spreadsheetVersionHref, errorListVersionHref
} from '../../util/App';

import '../../../css/App.css'
import '../../../css/Connection.css'

import { MODAL_AUTH } from '../../actions/main/Service'
import { isCellOutputRequest } from '../../actions/project/Notebook';

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
     * Create the routing elements in the DOM and display connection
     * information.
     */
    render() {
        // Set the window title
        if (window.env.APP_TITLE) {
            document.title = 'Vizier DB - ' + window.env.APP_TITLE
        } else {
            document.title = 'Vizier DB'
        }
        const { error, isFetching, links, name, showModal, refetch } = this.props;
        let content = null;
        let connection = null;
        if (isFetching) {
            // Show a content spinner if the API service descriptor is still
            // being fetched.
            content = <ContentSpinner />;
        } else if (error) {
            // Error message if the service descriptor could not be fetched
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
        } else if (refetch) {
            // Refetch service descriptor after the user entered authentication
            // information
        	this.refetchService();
        } else if ((name != null) && (links != null)) {
            // If the service descriptor was loaded successfully display page
            // content depending on the selected route
            content = (
                <MuiThemeProvider>
                    <Router>
                        <Switch>
                            <Route exact path={baseHref} component={MainPage} />
                            <Route path={spreadsheetHref} component={SpreadsheetPage} />
                            <Route path={errorListHref} component={DatasetCaveatsPage} />
                            <Route path={spreadsheetVersionHref} component={SpreadsheetPage} />
                            <Route path={errorListVersionHref} component={DatasetCaveatsPage} />
                            <Route path={branchHistoryHref} component={BranchPage} />
                            <Route path={notebookHeadHref} component={NotebookPage} />
                            <Route path={notebookVersionHref} component={NotebookPage} />
                            <Route path={spreadsheetHref} component={SpreadsheetPage} />
                            <Route path={errorListHref} component={DatasetCaveatsPage} />
                        </Switch>
                    </Router>
                </MuiThemeProvider>
            );
            const cellOutput = isCellOutputRequest();
            if(cellOutput){
            	connection = null;
            }
            else{
            	// Show connection information at the bottom of the page
                connection = (
	                <div className='connection-info'>
	                    <ConnectionInfo name={name} links={links}/>
	                </div>
	            );
            }
        }
        // Add authentication modal
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
                { content }
                { connection }
                { modals }
          </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        error: state.serviceApi.error,
        isFetching: state.serviceApi.isFetching,
        links: state.serviceApi.links,
        name: state.serviceApi.name,
        serviceUrl: state.serviceApi.serviceUrl,
        showModal: state.serviceApi.showModal,
        refetch: state.serviceApi.refetch
    }
}

export default withRouter(connect(mapStateToProps)(App));
