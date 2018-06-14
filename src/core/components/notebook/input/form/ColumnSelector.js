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
* Selector component for datasets.
*/

// -----------------------------------------------------------------------------
// Helper Methods
// -----------------------------------------------------------------------------

/**
 * Convert column index into spreadsheet column label (letter).
 * Copied from:
 * https://stackoverflow.com/questions/21229180/convert-column-index-into-corresponding-column-letter
 *
 */
const COLUMN_2_LETTER = (column) => {
    let temp, letter = '';
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}


class ColumnSelector extends React.Component {
    static propTypes = {
        dataset: PropTypes.object,
        id: PropTypes.string.isRequired,
        isRequired: PropTypes.bool.isRequired,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        onChange: PropTypes.func.isRequired,
    }
    handleChange = (e, { value }) => {
        const { id, onChange } = this.props
        onChange(id, value)
    }
    render() {
        const { dataset, isRequired, value } = this.props
        let options = [];
        if (dataset != null) {
            if (!isRequired) {
                // Add entry to set value to empty if not required
                options.push({
                    key: '',
                    text: '<none>',
                    value: ''
                })
            }
            for (let i = 0; i < dataset.columns.length; i++) {
                const column = dataset.columns[i];
                let name = '';
                if (column.name !== '') {
                    name = column.name;
                } else {
                    name = COLUMN_2_LETTER(i + 1);
                }
                options.push({
                    key: column.id,
                    text: name,
                    value: column.id
                })
            }
        }
        return (
            <Dropdown
                value={value}
                selection
                fluid
                scrolling
                options={options}
                onChange={this.handleChange}
            />
        )
    }
}

export default ColumnSelector;
