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
import { Form } from 'semantic-ui-react';
import { ErrorListMessage } from '../../Message';
import PythonCell from './form/PythonCell';
import ModuleFormControl from './form/ModuleFormControl';
import { DT_DATASET_ID, DT_FILE_ID, DT_PYTHON_CODE } from './ModuleSpec';
import '../../../../css/ModuleForm.css';


// -----------------------------------------------------------------------------
// Helper Methods
// -----------------------------------------------------------------------------

/**
 * Returns the selected dataset if the command specification has a top-level
 * argument of type 'dataset' and the value in the module form for this
 * argument is set.
 */
const SELECTED_DATASET = (command, values, datasets) => {
    for (let i = 0; i < command.arguments.length; i++) {
        const arg = command.arguments[i];
        if (arg.datatype === DT_DATASET_ID) {
            const val = values[arg.id];
            if (val != null) {
                for (let j = 0; j < datasets.length; j++) {
                    const ds = datasets[j];
                    if (ds.name === val) {
                        return ds;
                    }
                }
            }
        }
    }
}


// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

class ModuleInputForm extends React.Component {
    static propTypes = {
        datasets: PropTypes.array.isRequired,
        env: PropTypes.object.isRequired,
        errors: PropTypes.array,
        hasError: PropTypes.bool.isRequired,
        selectedCommand: PropTypes.object.isRequired,
        values: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onDismissErrors: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired
    }
    render() {
        const {
            datasets,
            env,
            errors,
            hasError,
            selectedCommand,
            values,
            onChange,
            onDismissErrors,
            onSubmit
        } = this.props;
        // The for is a table that contains one row per (top-level) argument.
        // Output differs, however, if the command is a Python cell.
        // In either case, if there is an error a message box will be displayed.
        let error = null
        if (hasError) {
            if (errors != null) {
                error = (
                    <ErrorListMessage
                        title={'Invalid Arguments'}
                        errors={errors}
                        onDismiss={onDismissErrors}
                    />
                )
            }
        }
        const args = selectedCommand.arguments
        if ((args.length === 1) && (args[0].datatype === DT_PYTHON_CODE)) {
            const arg = args[0];
            return (
                <div className='code-form'>
                    { error }
                    <Form>
                        <PythonCell
                            key={arg.id}
                            id={arg.id}
                            name={arg.id}
                            value={values[arg.id]}
                            onChange={onChange}
                        />
                    </Form>
                </div>
            );
        } else {
            // Check if the command specification contains a dataset column. If so,
            // try to find the dataset that is being selected.
            const selectedDataset = SELECTED_DATASET(selectedCommand, values, datasets);
            args.sort((a1, a2) => (a1.index > a2.index));
            let cssTable = 'form-table';
            let components = [];
            for (let i = 0; i < args.length; i++) {
                const arg = args[i]
                // Skip elements that are part of a group or hidden
                if ((arg.parent) || (arg.hidden === true)) {
                    continue
                }
                components.push(
                    <tr key={arg.id}>
                        <td className='form-label'>{arg.name}</td>
                        <td className='form-control'>
                            <ModuleFormControl
                                key={arg.id}
                                commandArgs={args}
                                controlSpec={arg}
                                datasets={datasets}
                                env={env}
                                selectedDataset={selectedDataset}
                                value={values[arg.id]}
                                onChange={onChange}
                                onSubmit={onSubmit}
                            />
                        </td>
                    </tr>
                );
                if (arg.datatype === DT_FILE_ID) {
                    cssTable += ' wide';
                }
            }
            let formCss = 'module-form'
            if (hasError) {
                formCss += '-error'
            }
            return (
                <div className={formCss}>
                    { error }
                    <table className={cssTable}>
                        <tbody>
                            { components }
                        </tbody>
                    </table>
                </div>
            );
        }
    }
}

export default ModuleInputForm;
