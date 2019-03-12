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
import SQLCell from './form/SQLCell';
import ScalaCell from './form/ScalaCell';
import ModuleFormControl from './form/ModuleFormControl';
import { DT_CODE, DT_FILE_ID, selectedDataset } from '../../../resources/Engine';
import '../../../../css/ModuleForm.css';


class ModuleInputForm extends React.Component {
    static propTypes = {
        datasets: PropTypes.array.isRequired,
        errors: PropTypes.array,
        hasError: PropTypes.bool.isRequired,
        selectedCommand: PropTypes.object.isRequired,
        values: PropTypes.object.isRequired,
        codeEditorProps: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onDismissErrors: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired
    }
    render() {
        const {
            datasets,
            errors,
            hasError,
            selectedCommand,
            values,
            codeEditorProps,
            onChange,
            onDismissErrors,
            onSubmit
        } = this.props;
        // The for is a table that contains one row per (top-level) argument.
        // Output differs, however, if the command is a Python cell.
        // In either case, if there is an error a message box will be displayed.
        let error = null;
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
        // Check if the command specification contains a dataset column. If so,
        // try to find the dataset that is being selected.
        const selectedDS = selectedDataset(selectedCommand, values, datasets);
        let cssTable = 'form-table';
        let components = [];
        for (let i = 0; i < selectedCommand.parameters.length; i++) {
            const para = selectedCommand.parameters[i];
            // Skip elements that are part of a group, hidden or are of type
            // code
            if ((para.parent) || (para.hidden === true) || (para.datatype === DT_CODE)) {
                continue;
            }
            components.push(
                <tr key={para.id}>
                    <td className='form-label'>{para.name}</td>
                    <td className='form-control'>
                        <ModuleFormControl
                            key={para.id}
                            commandArgs={selectedCommand.parameters}
                            controlSpec={para}
                            datasets={datasets}
                            selectedDataset={selectedDS}
                            value={values[para.id]}
                            onChange={onChange}
                            onSubmit={onSubmit}
                        />
                    </td>
                </tr>
            );
            if (para.datatype === DT_FILE_ID) {
                cssTable += ' wide';
            }
        }
        let formCss = 'module-form';
        if (hasError) {
            formCss += '-error';
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

export default ModuleInputForm;
