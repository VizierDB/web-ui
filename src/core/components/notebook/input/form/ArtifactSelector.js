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
class ArtifactSelector extends React.Component {
    static propTypes = {
        artifacts: PropTypes.array.isRequired,
        id: PropTypes.string.isRequired,
        artifactType: PropTypes.string,
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
        const { artifacts, artifactType, isRequired, value } = this.props
        let options = [];
        if (!isRequired) {
            // Add entry to set value to empty if not required
            options.push({
                key: '',
                text: '<none>',
                value: ''
            })
        }
        for (let i = 0; i < artifacts.length; i++) {
            const artifact = artifacts[i];
            if(artifactType == null || artifactType == artifact.artifact_type){
                options.push({
                    key: artifact.name,
                    text: artifact.name,
                    value: artifact.name
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

export default ArtifactSelector
