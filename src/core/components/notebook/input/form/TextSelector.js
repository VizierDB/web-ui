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
class TextSelector extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        options: PropTypes.array.isRequired,
        isRequired: PropTypes.bool.isRequired,
        value: PropTypes.string,
        onChange: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        const { options, isRequired } = props;
        const listItems = [];
        if (!isRequired) {
            // Add entry to set value to empty if not required
            listItems.push({
                key: '',
                text: '<none>',
                value: ''
            })
        }
        for (let i = 0; i < options.length; i++) {
            const entry = options[i];
            // Check whether the entry is a structired value or a string
            if (typeof entry === 'object') {
                // A structured value is expected to have at least a .value
                // element. Other optional elements are .key and .isDefault
                let entryKey = null;
                if (entry.key) {
                    entryKey = entry.key;
                } else {
                    entryKey = entry.value;
                }
                listItems.push({
                    key: entryKey,
                    text: entry.text,
                    value: entryKey
                })
            } else {
                // Assumes entry to be a scalar (string) value
                listItems.push({
                    key: entry,
                    text: entry,
                    value: entry
                })
            }
        }
        this.state ={listItems};
    }
    handleChange = (event, { value }) => {
        const { id, onChange } = this.props
        onChange(id, value)
    }
    render() {
        const { id, value } = this.props;
        const { listItems } = this.state;
        return (
            <Dropdown
                name={id}
                selection
                scrolling
                fluid
                options={listItems}
                value={value}
                onChange={this.handleChange}
            />
        );
    }
}

export default TextSelector
