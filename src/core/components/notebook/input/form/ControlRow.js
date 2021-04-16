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
        controlSpec: PropTypes.object.isRequired,
        datasets: PropTypes.array.isRequired,
        artifacts: PropTypes.array.isRequired,
        id: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        selectedDataset: PropTypes.object,
        serviceProperties: PropTypes.object.isRequired,
        value: PropTypes.object.isRequired
    }
    /**
     * Handle change in any of the group's input controls.
     */
    handleChange = (name, value) => {
        const { id, onChange } = this.props;
        let formValue = {...this.props.value};
        formValue[name] = value;
        onChange(id, formValue)
    }
    render() {
        const {
            controlSpec,
            datasets,
            artifacts,
            selectedDataset,
            serviceProperties,
            value
        } = this.props;
        const formLabels = []
        const formControls = []
        console.log("ROW")
        console.log(value)
        for (let i = 0; i < controlSpec.parameters.length; i++) {
            const child = controlSpec.parameters[i]
            console.log("CHILD")
            console.log(child)
            formLabels.push(
                <td key={formLabels.length} className='inner-form-header'>
                    {child.name}
                </td>
            )
            formControls.push(
                <td key={formControls.length} className='inner-form-control'>
                    <ModuleFormControl
                        key={child.id}
                        controlSpec={child}
                        datasets={datasets}
                        artifacts={artifacts}
                        onChange={this.handleChange}
                        selectedDataset={selectedDataset}
                        serviceProperties={serviceProperties}
                        value={value[child.id]}
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
