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
class DatasetSelector extends React.Component {
    static propTypes = {
        datasets: PropTypes.array.isRequired,
        id: PropTypes.string.isRequired,
        isRequired: PropTypes.bool.isRequired,
        value: PropTypes.string,
        onChange: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        const { value } = this.props;
        this.state = {ctrlValue: value};
    }
    /**
     * Handle change in the dropdown box. This event fires whenever the user
     * clicks on the select box. We maintain the current value in the local
     * state to avoid updating the form values if nothing has changed.
     * This is important here since a change to the dataset selector will
     * trigger all column id controls to reset.
     */
    handleChange = (e, { value }) => {
        const { id, onChange } = this.props
        const { ctrlValue } = this.state;
        if (ctrlValue !== value) {
            this.setState({ctrlValue: value});
            onChange(id, value, null)
        }
    }
    render() {
        const { datasets, isRequired, value } = this.props
        let options = [];
        if (!isRequired) {
            // Add entry to set value to empty if not required
            options.push({
                key: '',
                text: '<none>',
                value: ''
            })
        }
        for (let i = 0; datasets && i < datasets.length; i++) {
            const dataset = datasets[i];
            options.push({
                key: dataset.name,
                text: dataset.name,
                value: dataset.name
            })
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

export default DatasetSelector
