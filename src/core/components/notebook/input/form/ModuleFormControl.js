import React from 'react';
import { PropTypes } from 'prop-types';
import BoolInput from './BoolInput';
import ColumnSelector from './ColumnSelector';
import ControlGroup from './ControlGroup';
import ControlRow from './ControlRow';
import DatasetSelector from './DatasetSelector';
import FileSelector from './FileSelector';
import TextControl from './TextControl';
import TextSelector from './TextSelector';
import {
    DT_AS_ROW, DT_BOOL, DT_COLUMN_ID, DT_DATASET_ID, DT_DECIMAL, DT_FILE_ID,
    DT_GROUP, DT_INT, DT_ROW_ID, DT_STRING
} from '../ModuleSpec';


/**
 * Generic form control. Generates a module form control instance from a given
 * specification.
 */
class ModuleFormControl extends React.Component {
    static propTypes = {
        commandArgs: PropTypes.array.isRequired,
        controlSpec: PropTypes.object.isRequired,
        datasets: PropTypes.array.isRequired,
        env: PropTypes.object.isRequired,
        selectedDataset: PropTypes.object,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.bool,
            PropTypes.object
        ]),
        onChange: PropTypes.func.isRequired,
        onSubmit: PropTypes.func
    }
    render() {
        const {
            commandArgs, controlSpec, datasets, env, selectedDataset, value,
            onChange, onSubmit
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
        } else if (controlSpec.datatype === DT_DATASET_ID) {
            return (
                <DatasetSelector
                    key={controlSpec.id}
                    id={controlSpec.id}
                    isRequired={controlSpec.required ? true : false}
                    name={controlSpec.id}
                    datasets={datasets}
                    value={value}
                    onChange={onChange}
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
            (controlSpec.datatype === DT_STRING) ||
            (controlSpec.datatype === DT_ROW_ID) ||
            (controlSpec.datatype === DT_INT) ||
            (controlSpec.datatype === DT_DECIMAL)
        ) {
            return (
                <TextControl
                    key={controlSpec.id}
                    id={controlSpec.id}
                    name={controlSpec.id}
                    placeholder={controlSpec.name}
                    value={value}
                    onChange={onChange}
                    onSubmit={onSubmit}
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
                    files={env.files}
                    value={value}
                    onChange={onChange}
                />
            )
        } else if (controlSpec.datatype === DT_GROUP) {
            const children = []
            for (let j = 0; j < commandArgs.length; j++) {
                const child = commandArgs[j]
                if (child.parent === controlSpec.id) {
                    children.push(child)
                }
            }
            return (
                <ControlGroup
                    key={controlSpec.id}
                    children={children}
                    commandArgs={commandArgs}
                    datasets={datasets}
                    env={env}
                    id={controlSpec.id}
                    name={controlSpec.id}
                    selectedDataset={selectedDataset}
                    value={value}
                    onChange={onChange}
                />
            )
        } else if (controlSpec.datatype === DT_AS_ROW) {
            const children = []
            for (let j = 0; j < commandArgs.length; j++) {
                const child = commandArgs[j]
                if (child.parent === controlSpec.id) {
                    children.push(child)
                }
            }
            return (
                <ControlRow
                    key={controlSpec.id}
                    children={children}
                    commandArgs={commandArgs}
                    datasets={datasets}
                    env={env}
                    id={controlSpec.id}
                    name={controlSpec.id}
                    selectedDataset={selectedDataset}
                    value={value}
                    onChange={onChange}
                />
            )
        } else {
            return null;
        }
    }
}

export default ModuleFormControl;