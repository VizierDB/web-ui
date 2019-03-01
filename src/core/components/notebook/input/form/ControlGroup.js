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
import { DT_COLUMN_ID, DT_FILE_ID } from '../ModuleSpec';
import '../../../../../css/Notebook.css';
import '../../../../../css/ModuleForm.css';


// -----------------------------------------------------------------------------
// Local helper functions
// -----------------------------------------------------------------------------

/**
 * Get the value of the name property for a resource with given id. Expects a
 * list of objects that have .name and .id properties. If no matching resource
 * is found the result is null;
 */
const resourceName = (resources, id) => {
    const res = resources.find((r) => (r.id === id));
    if (res != null) {
        return res.name;
    } else {
        return null;
    }
}


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
        const { value } = this.props;
        this.defaultValues = {...value.values};
        this.state = ({formValues: value.values, tuples: value.tuples});
    }
    /**
     * Update internal state if any column id children have been reset.
     */
    componentWillReceiveProps(newProps) {
        const { value } = newProps;
        this.setState({formValues: value.values, tuples: value.tuples});
    }
    /**
     * Handle change in any of the group's input controls.
     */
    handleChange = (name, value) => {
        const { id, onChange } = this.props;
        const { formValues, tuples } = this.state;
        const values = {...formValues};
        values[name] = value;
        this.setState({formValues: values});
        onChange(id, {values, tuples})
    }
    /**
     * Add the current values in the form controls as a tuple to the list of
     * argument values.
     */
    handleAdd = () => {
        const { id, onChange } = this.props;
        const { formValues, tuples } = this.state;
        tuples.push({...formValues});
        // Clear the form values
        const values = {...this.defaultValues};
        this.setState({formValues: values, tuples});
        onChange(id, {values, tuples});
    }
    /**
     * Remove an existing tuple from the list of argument values.
     */
    handleRemove = (e, { value }) => {
        const { id, onChange } = this.props
        const { tuples } = this.state
        const modifiedTuples = []
        let removedTuple =  null
        for (let i = 0; i < tuples.length; i++) {
            if (i !== value) {
                modifiedTuples.push(tuples[i])
            }
            else{
            	removedTuple = {...tuples[i]}
            }
        }
        this.setState({tuples: modifiedTuples, formValues:removedTuple})
        onChange(id, {values: removedTuple, tuples: modifiedTuples})
    }
    render() {
        const {
            children, commandArgs, datasets, env, selectedDataset
        } = this.props;
        const { tuples, formValues } = this.state;
        // The layout is a table with three main components: The input control
        // names, existing group tuples, and the form controls.
        const rows = [];
        // Stat by generating the header and control row.
        const formControls = [];
        const formLabels = [];
        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            formLabels.push(
                <td key={formLabels.length} className='inner-form-header'>
                    {child.name}
                </td>
            );
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
        // Add empty column to label header (as placeholder for tuple and
        // control buttons).
        formLabels.push(
            <td key={formLabels.length}  className='inner-form-button' />
        )
        // Add button to control row to add the current control values as a new
        // tuple.
        formControls.push(
            <td key={formControls.length} className='inner-form-button'>
                <Button icon='plus' positive onClick={this.handleAdd}/>
            </td>
        )
        // Add labels as first row of output table.
        rows.push(<tr key='header'>{formLabels}</tr>);
        // Create output table rows for existing tuples
        for (let i = 0; i < tuples.length; i++) {
            const tuple = tuples[i]
            const row = []
            for (let j = 0; j < children.length; j++) {
                const child = children[j];
                // If the child is a dataset or file selector we need to replace
                // the value with the respective resource name.
                let tval = tuple[children[j].id];
                if ((child.datatype === DT_COLUMN_ID) && (selectedDataset != null)) {
                    tval = resourceName(selectedDataset.columns, tval);
                } else if ((child.datatype === DT_COLUMN_ID) && (selectedDataset == null)) {
                        tval = 'unknown';
                } else if (child.datatype === DT_FILE_ID) {
                    tval = 'file';
                }
                row.push(
                    <td key={i + '#' + j} className='form-constant'>
                        {tval}
                    </td>
                )
            }
            row.push(
                <td key={i + '#' + children.length} className='inner-form-button'>
                    <Button icon='trash' value={i} negative onClick={this.handleRemove}/>
                </td>
            )
            rows.push(<tr key={'tuples' + i}>{row}</tr>)
        }
        // Add form conrols as last row of output table
        rows.push(<tr key='controls'>{formControls}</tr>);
        return (<table className='inner-form'><tbody>{rows}</tbody></table>);
    }
}

export default ControlGroup
