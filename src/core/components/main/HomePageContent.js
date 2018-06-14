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
import PropTypes from 'prop-types'
import { Grid } from 'semantic-ui-react'
import '../../../css/App.css'


/**
* Simple component to display home page content that is part of the API service
* descriptor.
*/
class HomePageContent extends React.Component {
    static propTypes = {
        content: PropTypes.string
    }
    render() {
        let { content } = this.props
        if (!content) {
            content = (
                <div>
                    <h1 className='home-headline'>
                        Welcome to Vizier
                        <span className='headline-small'>Streamlined Data Curation</span>
                    </h1>
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={8}>
                                <h3 className='home-headline'>About the Project</h3>
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
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <h3 className='home-headline'>Getting Started</h3>
                                <p className='home-text'>
                                    <span className='sys-name'>Vizier</span>  organizes
                                    data curation workflows into projects. Start by
                                    selecting or creating a new project under the <b>Projects Tab</b>.
                                </p>
                                <p className='home-text'>
                                    If the data that you want to clean is currently stored in
                                    CSV files, these files have to be uploaded to the file
                                    server. You can upload your data files under the <b>Files Tab</b>.
                                </p>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>
            )
        }
        return (
            <div className='home-content'>
                { content }
            </div>
        );
    }
}

export default HomePageContent
