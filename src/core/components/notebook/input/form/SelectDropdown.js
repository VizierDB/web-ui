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
* Dropdown selector for text values
*/
class SelectDropdown extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        options: PropTypes.array.isRequired,
        value: PropTypes.string,
        onChange: PropTypes.func.isRequired
    }
    render() {
        const { id, onChange, options, value } = this.props
        let selectedValue = value;
        const listing = [];
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
                if ((entry.isDefault) && (selectedValue == null)) {
                    selectedValue = entry.value;
                }
                listing.push({
                    key: entryKey,
                    text: entry.value,
                    value: entryKey
                })
            } else {
                // Assumes entry to be a scalar (string) value
                listing.push({
                    key: entry,
                    text: entry,
                    value: entry
                })
            }
        }
        return <Dropdown
                text={selectedValue}
                name={id}
                selection
                scrolling
                fluid
                options={listing}
                onChange={onChange}
            />;
    }
}

export default SelectDropdown;
