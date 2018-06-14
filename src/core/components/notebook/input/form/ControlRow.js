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
import ModuleFormControl from './ModuleFormControl'
import '../../../../../css/Notebook.css'
import '../../../../../css/ModuleForm.css'


/**
 * A row of control elements. This is a style-element. All elements are shown in
 * a single row layout.
 *
 * Expects a value that is an object with a sigle element values which in turn
 * is an object with a single value for each element in the row.
 */
class ControlRow extends React.Component {
    static propTypes = {
        children: PropTypes.array.isRequired,
        commandArgs: PropTypes.array.isRequired,
        datasets: PropTypes.array.isRequired,
        env: PropTypes.object.isRequired,
        id: PropTypes.string.isRequired,
        selectedDataset: PropTypes.object,
        value: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        const { value } = props;
        this.state = {formValues: value.values}
    }
    /**
     * Update internal state if any column id children have been reset.
     */
    componentWillReceiveProps(newProps) {
        const { value } = newProps;
        this.setState({formValues: value.values});
    }
    /**
     * Handle change in any of the group's input controls.
     */
    handleChange = (name, value) => {
        const { formValues } = this.state;
        const { id, onChange } = this.props;
        let values = {...formValues};
        values[name] = value;
        this.setState({formValues: values});
        onChange(id, {values})
    }
    render() {
        const {
            children, commandArgs, datasets, env, selectedDataset
        } = this.props
        const { formValues } = this.state
        const formLabels = []
        const formControls = []
        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            formLabels.push(
                <td key={formLabels.length} className='inner-form-header'>
                    {child.name}
                </td>
            )
            formControls.push(
                <td key={formControls.length} className='inner-form-control'>
                    <ModuleFormControl
                        key={child.id}
                        commandArgs={commandArgs}
                        controlSpec={child}
                        datasets={datasets}
                        env={env}
                        selectedDataset={selectedDataset}
                        value={formValues[child.id]}
                        onChange={this.handleChange}
                    />
                </td>
            );
        }
        return (
            <table className='inner-form'>
                <tbody>
                    <tr key='row-header'>{ formLabels }</tr>
                    <tr key='row-values'>{formControls}</tr>
                </tbody>
            </table>
        )
    }
}

export default ControlRow
