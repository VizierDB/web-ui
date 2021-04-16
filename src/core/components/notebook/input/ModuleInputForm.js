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
import ModuleFormControl from './form/ModuleFormControl';
import { DT_CODE, DT_FILE_ID, getSelectedDataset } from '../../../resources/Engine';
import '../../../../css/ModuleForm.css';
import ModuleInputFormDecorator from "./ModuleInputFormDecorator";


class ModuleInputForm extends React.Component {
    static propTypes = {
        datasets: PropTypes.array.isRequired,
        artifacts: PropTypes.array.isRequired,
        selectedCommand: PropTypes.object.isRequired,
        serviceProperties: PropTypes.object.isRequired,
        values: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired
    }
    render() {
        const {
            datasets,
            artifacts,
            selectedCommand,
            serviceProperties,
            onChange,
            values
        } = this.props;
        // Check if the command specification contains a dataset column. If so,
        // try to find the dataset that is being selected.
        const selectedDataset = getSelectedDataset(selectedCommand, values, datasets);
        // If the command contains a file parameter then the style of the table
        // should be wide.
        let cssTable = 'form-table';
        let components = [];
        for (let i = 0; i < selectedCommand.parameters.length; i++) {
            const para = selectedCommand.parameters[i];
            // Skip elements that are part of a group, hidden or are of type
            // code
            if ((para.parent == null) && (para.hidden !== true) && (para.datatype !== DT_CODE)) {
                // Values may be undefined
                //let val = null;
                //if (values != null) {
                //    val = values[para.id];
                //}
                components.push(
                    <tr key={para.id}>
                        <td className='form-label'>{para.name}</td>
                        <td className='form-control'>
                            <ModuleFormControl
                                key={para.id}
                                controlSpec={para}
                                datasets={datasets}
                                artifacts={artifacts}
                                selectedDataset={selectedDataset}
                                serviceProperties={serviceProperties}
                                value={values[para.id]}
                                onChange={onChange}
                            />
                        </td>
                    </tr>
                );
                if (para.datatype === DT_FILE_ID) {
                    cssTable += ' wide';
                }
            }
        }
        return (
            <ModuleInputFormDecorator
                components={ components }
                selectedCommand={ selectedCommand }
                cssTable = {cssTable}
                datasets = { datasets }
                artifacts = { artifacts }
                selectedDataset = { selectedDataset }
                serviceProperties = { serviceProperties }
                values = { values }
                onChange = { onChange }
            />
        );
    }
}

export default ModuleInputForm;
