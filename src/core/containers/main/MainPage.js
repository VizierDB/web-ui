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
import { connect } from 'react-redux'
import { Dropdown, Grid, Icon, Menu } from 'semantic-ui-react'
import { toggleShowProjectForm } from '../../actions/project/ProjectListing'
import { ConnectionInfo } from '../../components/Api'
import ProjectListing from '../project/ProjectListing'
import { pageUrl } from '../../util/App.js';
import '../../../css/App.css'


class MainPage extends Component {
    static propTypes = {
        homePageContent: PropTypes.string,
        isFetching: PropTypes.bool.isRequired,
        projects: PropTypes.array,
        serviceApi: PropTypes.object,
        showForm: PropTypes.bool.isRequired
    }
    /**
     */
    render() {
        const {
            homePageContent,
            isFetching,
            projects,
            serviceApi,
            showForm
        } = this.props;
        let headline = null;
        let description = null;
        if (homePageContent != null) {
            headline  = homePageContent.headline;
            description = homePageContent.description;
        } else {
            headline = (
                <span>
                    Welcome to Vizier
                    <span className='headline-small'>
                        Streamlined Data Curation
                    </span>
                </span>
            );
        }
        let createProjectLink = ' creating a new project';
        if ((!showForm) && (!isFetching)) {
            createProjectLink = (
                <span className='action'>
                    <a className='action-link' onClick={this.toggleCreateProjectForm}>
                        {createProjectLink}
                    </a>
                </span>
            );
        }
        const content = (
            <div className='home-content'>
                <h1 className='home-headline'>{headline}</h1>
                { description }
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={8}>
                            <h3 className='home-headline'>Getting Started</h3>
                            <p className='home-text'>
                                <span className='sys-name'>Vizier</span>  organizes
                                data curation workflows into projects. Start by
                                {createProjectLink} or by selecting a project from
                                the menu or the list below.
                            </p>
                            <ProjectListing />
                        </Grid.Column>
                        <Grid.Column width={8}>
                            <div>
                                <h3 className='home-headline'>About Vizier</h3>
                                <p className='home-text'>
                                    <span className='sys-name'>Vizier</span> is a new powerful tool to streamline the data
                                    curation process. Data curation (also known as data preparation,
                                    wrangling, or cleaning) is a critical stage in data science
                                    in which raw data is structured, validated, and repaired.
                                    Data validation and repair establish trust in analytical
                                    results, while appropriate structuring streamlines
                                    analytics.
                                </p>
                                <p className='home-text'>
                                    <span className='sys-name'>Vizier</span>  makes it easier and faster to explore and
                                    analyze raw data by combining a simple notebook interface
                                    with spreadsheet views of your data. Powerful back-end
                                    tools that track changes, edits, and the effects of
                                    automation. These forms of <span className='text-highlight'>provenance</span> capture
                                    both parts of the exploratory curation process - how the
                                    cleaning workflows evolve, and how the data changes over time.
                                </p>
                                <p className='home-text'>
                                    <span className='sys-name'>Vizier</span> is
                                    a collaboration between the <a href='http://www.buffalo.edu/' className='external-link'>University at Buffalo</a>, <a href='http://www.nyu.edu/' className='external-link'>New York University</a>, and the <a href='https://web.iit.edu/' className='external-link'>Illinois Institute of Technology</a>.
                                </p>
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
        let projectsMenu = null;
        if (projects != null) {
            const projectItems = [];
            for (let i = 0; i < projects.length; i++) {
                const pj = projects[i];
                const link = pageUrl(pj.id);
                projectItems.push(
                    <Dropdown.Item
                        key={pj.id}
                        icon='database'
                        text={pj.name}
                        href={link}
                    />
                );
            }
            projectsMenu = (
                <Dropdown
                    disabled={projects.length === 0}
                    item
                    text='Projects'
                >
                    <Dropdown.Menu>
                        { projectItems }
                        <Dropdown.Divider />
                        <Dropdown.Item
                            key='new'
                            icon='plus'
                            text='New Project ...'
                            disabled={showForm || isFetching}
                            onClick={this.toggleCreateProjectForm}
                        />
                    </Dropdown.Menu>
                </Dropdown>
            );
        }
        return (
            <div className='main-page'>
                <div className='main-menu'>
                    <Menu secondary>
                        <Menu.Item header>
                            <Icon name='home' />
                            {window.env.APP_TITLE}
                        </Menu.Item>
                        { projectsMenu }
                    </Menu>
                </div>
                <div className='page-content wide'>
                    { content }
                    <ConnectionInfo api={serviceApi}/>
                </div>
            </div>
        );
    }
    /**
     * Toggle visibility of the create project form.
     */
    toggleCreateProjectForm = () => {
        const { dispatch } = this.props;
        dispatch(toggleShowProjectForm())
    }
}

const mapStateToProps = state => {

    return {
        homePageContent: state.mainPage.homePageContent,
        isFetching: state.projectListing.isFetching,
        projects: state.projectListing.projects,
        serviceApi: state.serviceApi,
        showForm: state.projectListing.showForm
    }
}

export default connect(mapStateToProps)(MainPage)
