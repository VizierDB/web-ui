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
import { Header, Button, Popup, Grid, Dropdown, Icon, GridColumn } from 'semantic-ui-react'
import { HATEOAS_DATASET_DOWNLOAD } from '../../../util/HATEOAS'

/**
 * Dropdown menu for spreadsheets in the content header. Includes items to
 * download the dataset and to copy the dataset URL to the clipboard.
 */

class SpreadsheetDropDown extends React.Component {
    static propTypes = {
        dataset: PropTypes.object.isRequired,
        onEditSpreadsheet: PropTypes.func.isRequired,
        moduleId: PropTypes.string.isRequired,
        downloadLimit: PropTypes.number.isRequired,
        onRecommendAction: PropTypes.func
    }

    /**
     * Copy dataset download URL to the clipboard.
     */
    handleCopy = () => {
        const { dataset } = this.props
        const downloadUrl = dataset.links.get(HATEOAS_DATASET_DOWNLOAD)
        const textField = document.createElement('textarea');
        textField.innerText = downloadUrl;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        textField.remove();
    }
    /**
     * Open a new window with the dataset URL to download the data in CSV
     * format if row count less than the allowed value. If not, recommend the UNLOAD DATASET cell
     */
    handleDownload = () => {
        const { dataset, downloadLimit } = this.props;
        if (dataset.rowCount <= downloadLimit){
            const downloadUrl = dataset.links.get(HATEOAS_DATASET_DOWNLOAD)
            window.open(downloadUrl);
        }
    };
    /**
     * Handles the edit spreadsheet selection
     */
    handleEditSpreadsheet = () => {
        const { dataset, onEditSpreadsheet, moduleId } = this.props;
        onEditSpreadsheet(dataset, moduleId)
    }
    render() {
        const { dataset, downloadLimit, onRecommendAction } = this.props;
        let downloadDropdown = <Popup trigger={<Dropdown.Item
            key={'download'}
            icon='download'
            text='Download File'
            title='Download dataset as CSV file'
            onClick={this.handleDownload}
        />}
                                      on='click'
                                      disabled = {dataset.rowCount <= downloadLimit}
                                      hoverable
                                      basic>
            <Grid centered>
                <GridColumn textAlign='center'>
                    <Header as='h4' icon textAlign='center'>
                        <Icon name='times circle' />
                    </Header>
                    <p>
                        {'The dataset exceeds the allowed limit of ' + downloadLimit + ' rows. It is recommended to export large datasets using the Unload Cell.'}
                    </p>
                    <Button color='blue' content='Unload' onClick={() => onRecommendAction('data','unload')} />
                </GridColumn>
            </Grid>
        </Popup>;

        return <React.Fragment>
            <Dropdown icon='download' title='Download dataset'>
                <Dropdown.Menu>
                    {downloadDropdown}
                    <Dropdown.Item
                        key={'copy-link'}
                        icon='linkify'
                        text='Copy URL to Clipboard'
                        title='Copy shareable dataset URL to clipboard'
                        onClick={this.handleCopy}
                    />
                    <Dropdown.Item
                        key={'edit'}
                        icon='edit'
                        text='Edit as Spreadsheet'
                        title='Open spreadsheet view to edit the dataset'
                        onClick={this.handleEditSpreadsheet}
                    />
                </Dropdown.Menu>
            </Dropdown>
        </React.Fragment>
    }
}

export default SpreadsheetDropDown;
