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
import { Dropdown } from 'semantic-ui-react'
import { HATEOAS_DATASET_DOWNLOAD } from '../../../util/HATEOAS'

/**
 * Dropdown menu for spreadsheets in the content header. Includes items to
 * download the dataset and to copy the dataset URL to the clipboard.
 */

class SpreadsheetDropDown extends React.Component {
    static propTypes = {
        dataset: PropTypes.object.isRequired
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
     * format.
     */
    handleDownload = () => {
        const { dataset } = this.props
        const downloadUrl = dataset.links.get(HATEOAS_DATASET_DOWNLOAD)
        window.open(downloadUrl);
    }
    render() {
        return (
            <Dropdown icon='table' title='Download dataset'>
                <Dropdown.Menu>
                    <Dropdown.Item
                        key={'download'}
                        icon='download'
                        text='Download'
                        title='Download dataset as CSV file'
                        onClick={this.handleDownload}
                    />
                    <Dropdown.Item
                        key={'copy-link'}
                        icon='linkify'
                        text='Copy URL to clipboard'
                        title='Copy shareable dataset URL to clipboard'
                        onClick={this.handleCopy}
                    />
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

export default SpreadsheetDropDown;
