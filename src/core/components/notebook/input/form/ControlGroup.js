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

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import ModuleFormControl from './ModuleFormControl';
import { toFormValues, getSelectedDataset } from '../../../../resources/Engine';
import '../../../../../css/Notebook.css';
import '../../../../../css/ModuleForm.css';


// -----------------------------------------------------------------------------
// Local helper functions
// -----------------------------------------------------------------------------

/**
 * A group of control elements. Allows user to insert a set of tuples.
 *
 * Expects a value which is a pair of .values and .tuplels. The .values element
 * is an object with a single entry per element in the group. The .tuples
 * element is an array of tuples, each representing a complete group element.
 *
 * TODO: Checking of valid arguments is also not implementd yet.
 */
class ControlGroup extends React.Component {
    static propTypes = {
        controlSpec: PropTypes.object.isRequired,
        datasets: PropTypes.array.isRequired,
        artifacts: PropTypes.array.isRequired,
        id: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        selectedDataset: PropTypes.object,
        serviceProperties: PropTypes.object.isRequired,
        value: PropTypes.array.isRequired
    }
    constructor(props) {
        super(props);
        const { id, controlSpec, datasets } = this.props;
        const newRow = toFormValues(controlSpec.parameters, datasets, null, id)
        this.state = ({addTuple: newRow});
    }
    /**
     * Add the current values in the form controls as a tuple to the list of
     * argument values.
     */
    handleAdd = (childId, childValue) => {
        const { id, controlSpec, datasets, onChange } = this.props;
        const formValue = this.props.value;
        // Make a copy of the current form value
        const rows = []
        for (let i = 0; i < formValue.length; i++) {
            rows.push(formValue[i])
        }
        // Add a new row of default values to the modified row list
        let newRow = toFormValues(controlSpec.parameters, datasets, null, id)
        let blankRow = toFormValues(controlSpec.parameters, datasets, null, id)
        this.setState({addTuple: blankRow});
        newRow[childId] = childValue
        rows.push(newRow);
        onChange(id, rows);
    }
    /**
     * Handle change in any of the group's input controls.
     */
    handleChange = (rowIdx, name, value) => {
        const { id, onChange } = this.props;
        const formValue = this.props.value;
        // Make a copy of the form values where the value of the tuple that
        // is isentified by the row index is modified
        const rows = [];
        for (let i = 0; i < formValue.length; i++) {
            if ((i === rowIdx) || (value === null)) {
                const row = {...formValue[i]};
                row[name] = value;
                rows.push(row);
            } else {
                rows.push(formValue[i])
            }
        }
        onChange(id, rows);
    }
    /**
     * Remove an existing tuple from the list of argument values.
     */
    handleDelete = (e, { value }) => {
        const { id, onChange } = this.props;
        const formValue = this.props.value;
        // Make a copy of the current form value that does not contain the
        // row that is currently at position value
        const rows = []
        for (let i = 0; i < formValue.length; i++) {
            if (i !== value) {
                rows.push(formValue[i])
            }
            else {
            	this.setState({addTuple: ''});//formValue[i]});
            }
        }
        onChange(id, rows);
    }
    /**
     * Move the row at the given position (value) one position down in the form
     * value list.
     */
    handleMoveDown = (e, { value }) => {
        const { id, onChange } = this.props;
        const formValue = this.props.value;
        // Make a copy of the current form value
        const rows = [];
        let row = null;
        for (let i = 0; i < formValue.length; i++) {
            if (i === value) {
                row = formValue[i];
            } else {
                rows.push(formValue[i]);
                if (i === (value + 1)) {
                    rows.push(row);
                }
            }
        }
        onChange(id, rows);
    }
    /**
     * Move the row at the given position (value) one position up in the form
     * value list.
     */
    handleMoveUp = (e, { value }) => {
        const { id, onChange } = this.props;
        const formValue = this.props.value;
        // Make a copy of the current form value
        const rows = [];
        let row = null;
        for (let i = 0; i < formValue.length; i++) {
            if (i === (value - 1)) {
                row = formValue[i];
            } else {
                rows.push(formValue[i]);
                if (i === value) {
                    rows.push(row);
                }
            }
        }
        onChange(id, rows);
    }
    render() {
        const {
            controlSpec,
            datasets,
            artifacts,
            id,
            selectedDataset,
            serviceProperties,
            value
        } = this.props;
        const rows = [];
        // Stat by generating the header for the elements in the control group.
        const formLabels = [];
        for (let i = 0; i < controlSpec.parameters.length; i++) {
            const child = controlSpec.parameters[i]
            formLabels.push(
                <td key={'th_ctrl' + i} className='inner-form-header'>
                    {child.name}
                </td>
            );
        }
        // Add columns for controll buttons
        formLabels.push(<td key={'th_btn1'} className='inner-form-header'></td>);
        formLabels.push(<td key={'th_btn2'} className='inner-form-header'></td>);
        formLabels.push(<td key={'th_btn3'} className='inner-form-header'></td>);
        rows.push(<tr key='header'>{formLabels}</tr>);
        // Add a row of controls for each row in the form
        for (let t = 0; t < value.length; t++) {
            let tuple = value[t];
            let rowSelectedDataset = getSelectedDataset(controlSpec, tuple, datasets)

            const key = 'r_' + t + '_' + id;
            const rowControls = [];
            for (let c = 0; c < controlSpec.parameters.length; c++) {
                const child = controlSpec.parameters[c]
                rowControls.push(
                    <td key={key + '_ctrl_' + child.id} className='inner-form-control'>
                        <ModuleFormControl
                            key={child.id}
                            controlSpec={child}
                            datasets={datasets} 
                            artifacts={artifacts}
                           onChange={(name, value) => (this.handleChange(t, name, value))}
                            selectedDataset={rowSelectedDataset ? rowSelectedDataset : selectedDataset}
                            serviceProperties={serviceProperties}
                            value={tuple[child.id]}
                        />
                    </td>
                );
            }
            rowControls.push(
                <td key={key + '_btn_del'} className='inner-form-button'>
                    <Button
                        icon='trash'
                        value={t}
                        negative
                        onClick={this.handleDelete}
                        title='Delete row from the list'
                    />
                </td>
            );
            rowControls.push(
                <td key={key + '_btn_up'} className='inner-form-button'>
                    <Button
                        icon='chevron up'
                        disabled={t === 0}
                        onClick={this.handleMoveUp}
                        title='Move row one position up'
                        value={t}
                    />
                </td>
            );
            rowControls.push(
                <td key={key + '_btn_dowm'} className='inner-form-button'>
                    <Button
                        icon='chevron down'
                        disabled={t === (value.length - 1)}
                        onClick={this.handleMoveDown}
                        title='Move row one position down'
                        value={t}
                    />
                </td>
            );
            rows.push(<tr key={key}>{rowControls}</tr>);
        }
        const lastRowControls = [];
        const { addTuple } = this.state
        const key = 'r_' + (value.length+1) + '_' + id;
        for (let c = 0; c < controlSpec.parameters.length; c++) {
            const child = controlSpec.parameters[c]
            lastRowControls.push(
                <td key={key + '_ctrl_' + child.id} className='inner-form-control'>
                    <ModuleFormControl
                        key={child.id}
                        controlSpec={child}
                        datasets={datasets}
                        artifacts={artifacts}
                        onChange={(name, value) => (this.handleAdd(child.id, value))}
                        selectedDataset={selectedDataset}
                        serviceProperties={serviceProperties}
                        value={addTuple[child.id]}
                    />
                </td>
            );
        }
        const lastRow = <tr key={key}>{lastRowControls}</tr>
        // Add another row that contains the add button.
        return (
            <div>
                <table className='inner-form'><tbody>{rows}{lastRow}</tbody></table>
            </div>
        );
    }
}

export default ControlGroup
