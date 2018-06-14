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

/**
* Dropdown selector for uploaded files
*/
class FileSelector extends React.Component {
    static propTypes = {
        files: PropTypes.array.isRequired,
        id: PropTypes.string.isRequired,
        isRequired: PropTypes.bool.isRequired,
        value: PropTypes.string,
        onChange: PropTypes.func.isRequired
    }
    handleChange = (event, { value }) => {
        const { id, onChange } = this.props
        onChange(id, value)
    }
    render() {
        const { files, isRequired, value } = this.props
        let selectedFileName = ''
        const options = [];
        if (!isRequired) {
            // Add entry to set value to empty if not required
            options.push({
                key: '',
                text: '<none>',
                value: ''
            })
        }
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            options.push({
                key: file.id,
                text: file.name,
                value: file.id
            })
            if (file.id === value) {
                selectedFileName = file.name
            }
        }
        return (
            <Dropdown
                text={selectedFileName}
                selection
                fluid
                scrolling
                options={options}
                onChange={this.handleChange}
            />
        );
    }
}

export default FileSelector
