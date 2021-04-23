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
import { PropTypes } from 'prop-types';
import BoolInput from './BoolInput';
import ColumnSelector from './ColumnSelector';
import ControlGroup from './ControlGroup';
import ControlRow from './ControlRow';
import DatasetSelector from './DatasetSelector';
import ArtifactSelector from './ArtifactSelector';
import FileSelector from './FileSelector';
import TextControl from './TextControl';
import TextSelector from './TextSelector';
import {
    DT_BOOL, DT_COLUMN_ID, DT_DATASET_ID, DT_DECIMAL, DT_FILE_ID, DT_INT,
    DT_LIST, DT_RECORD, DT_ROW_ID, DT_ROW_INDEX, DT_SCALAR, DT_STRING, DT_URL,
    DT_ARTIFACT_ID
} from '../../../../resources/Engine';
import URLSelector from "./URLSelector";


/**
 * Generic form control. Generates a module form control instance from a given
 * specification.
 */
class ModuleFormControl extends React.Component {
    static propTypes = {
        controlSpec: PropTypes.object.isRequired,
        datasets: PropTypes.array.isRequired,
        artifacts: PropTypes.array.isRequired,
        selectedDataset: PropTypes.object,
        serviceProperties: PropTypes.object.isRequired,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.bool,
            PropTypes.object,
            PropTypes.array
        ]),
        onChange: PropTypes.func.isRequired
    }
    render() {
        const {
            controlSpec,
            datasets,
            artifacts,
            selectedDataset,
            serviceProperties,
            value,
            onChange
        } = this.props;
        if (controlSpec.datatype === DT_COLUMN_ID) {
             return (
                <ColumnSelector
                    key={controlSpec.id}
                    id={controlSpec.id}
                    isRequired={controlSpec.required ? true : false}
                    name={controlSpec.id}
                    dataset={selectedDataset}
                    value={value}
                    onChange={onChange}
                />
            )
        } else if (controlSpec.datatype === DT_ARTIFACT_ID) {
            return (
                <ArtifactSelector
                    key={controlSpec.id}
                    id={controlSpec.id}
                    isRequired={controlSpec.required ? true : false}
                    name={controlSpec.id}
                    artifactType={controlSpec.artifactType}
                    artifacts={artifacts}
                    datasets={datasets}
                    value={value}
                    onChange={onChange}
                />
            )
        } else if (controlSpec.datatype === DT_DATASET_ID) {
            return (
                <DatasetSelector
                    key={controlSpec.id}
                    id={controlSpec.id}
                    isRequired={controlSpec.required ? true : false}
                    name={controlSpec.id}
                    value={value}
                    onChange={onChange}
                    artifacts={artifacts}
                    datasets={datasets}
                />
            )
        } else if ((controlSpec.datatype === DT_STRING) && (controlSpec.values)) {
            return (
                <TextSelector
                    key={controlSpec.id}
                    id={controlSpec.id}
                    isRequired={controlSpec.required ? true : false}
                    name={controlSpec.id}
                    options={controlSpec.values}
                    value={value}
                    onChange={onChange}
                />
            )
        } else if (
            (controlSpec.datatype === DT_DECIMAL) ||
            (controlSpec.datatype === DT_INT) ||
            (controlSpec.datatype === DT_ROW_ID) ||
            (controlSpec.datatype === DT_ROW_INDEX) ||
            (controlSpec.datatype === DT_SCALAR) ||
            (controlSpec.datatype === DT_STRING)
        ) {
            return (
                <TextControl
                    key={controlSpec.id}
                    id={controlSpec.id}
                    name={controlSpec.id}
                    placeholder={controlSpec.name}
                    value={value}
                    onChange={onChange}
                />
            )
        } else if (controlSpec.datatype === DT_BOOL) {
            return (
                <BoolInput
                    key={controlSpec.id}
                    id={controlSpec.id}
                    name={controlSpec.id}
                    value={value}
                    onChange={onChange}
                />
            )
        } else if (controlSpec.datatype === DT_FILE_ID) {
            return (
                <FileSelector
                    key={controlSpec.id}
                    id={controlSpec.id}
                    isRequired={controlSpec.required ? true : false}
                    name={controlSpec.id}
                    serviceProperties={serviceProperties}
                    value={value}
                    onChange={onChange}
                />
            )
        } else if (controlSpec.datatype === DT_URL) {
            return (
                <URLSelector
                    key={controlSpec.id}
                    id={controlSpec.id}
                    isRequired={controlSpec.required ? true : false}
                    name={controlSpec.id}
                    serviceProperties={serviceProperties}
                    value={value}
                    onChange={onChange}
                />
            )
        } else if (controlSpec.datatype === DT_LIST) {
            return (
                <ControlGroup
                    key={controlSpec.id}
                    controlSpec={controlSpec}
                    datasets={datasets}
                    artifacts={artifacts}
                    id={controlSpec.id}
                    name={controlSpec.id}
                    selectedDataset={selectedDataset}
                    serviceProperties={serviceProperties}
                    value={value === undefined ? [] : value}
                    onChange={onChange}
                />
            )
        } else if (controlSpec.datatype === DT_RECORD) {
            return (
                <ControlRow
                    key={controlSpec.id}
                    controlSpec={controlSpec}
                    datasets={datasets}
                    artifacts={artifacts}
                    id={controlSpec.id}
                    name={controlSpec.id}
                    selectedDataset={selectedDataset}
                    serviceProperties={serviceProperties}
                    value={value === undefined ? {} : value}
                    onChange={onChange}
                />
            )
        } else {
            return null;
        }
    }
}

export default ModuleFormControl;
