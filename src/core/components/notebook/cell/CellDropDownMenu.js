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
import { Dropdown } from 'semantic-ui-react';
import { CONTENT_CHART, CONTENT_DATASET, CONTENT_HIDE, CONTENT_TEXT,
    CONTENT_TIMESTAMPS } from '../../../resources/Notebook';
import '../../../../css/Notebook.css'


/**
 * Dropdown menu for a notebook cell. Contains set of operations that are
 * available for the cell as well as the cell output and resulting resources.
 */
class CellDropDownMenu extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        cellNumber: PropTypes.number.isRequired,
        notebook: PropTypes.object.isRequired,
        onAddFilteredCommand: PropTypes.func.isRequired,
        onCreateBranch: PropTypes.func.isRequired,
        onInsertCell: PropTypes.func.isRequired,
        onOutputSelect: PropTypes.func.isRequired
    }
    handleInsertBefore = () => {
        this.props.onInsertCell(-1);
    }
    handleInsertAfter = () => {
        this.props.onInsertCell(0);
    }
    render() {
        const {
            cell,
            cellNumber,
            notebook,
            onAddFilteredCommand,
            onCreateBranch,
            onOutputSelect
        } = this.props;
        const { module, output } = cell;
        // Determine the key of the selected output to disable the respective
        // menu entry.
        let selectedKey = null;
        if ((output.isText()) || (output.isHtml())) {
            selectedKey = 'console';
        } else if (output.isTimestamps()) {
            selectedKey = 'timestamps';
        } else if (output.isDataset()) {
            selectedKey = 'ds-' + output.dataset.name;
        } else if (output.isChart()) {
            selectedKey = 'vw-' + output.name;
        }
        // Create list of dropdon menu items. The first section contains the
        // cell actions edit, delete, insert cell (above/below) create new
        // branch at this cell, and hide commands like this. If the notebook is
        // read-only only the last teo items are shown
        const dropdownItems = [];
        //dropdownItems.push(<Dropdown.Header key='cell' content={'Cell (#' + cellNumber + ')'} />);
        //dropdownItems.push(<Dropdown.Divider key='div1'/>);
        if (!notebook.readOnly) {
            dropdownItems.push(
                <Dropdown.Item
                    key='edit'
                    icon='pencil'
                    text='Edit'
                    title={'Edit notebook cell #' + cellNumber}
                    onClick={() => (alert('Edit'))}
                />
            );
            dropdownItems.push(
                <Dropdown.Item
                    key='delete'
                    icon='trash'
                    text='Delete'
                    title={'Delete notebook cell #' + cellNumber}
                    onClick={() => (alert('Delete'))}
                />
            );
            dropdownItems.push(<Dropdown.Divider key='div1'/>);
            dropdownItems.push(
                <Dropdown.Item
                    key='insert-above'
                    icon='arrow circle up'
                    text='Insert cell above'
                    title={'Insert new notebook cell before cell #' + cellNumber}
                    onClick={this.handleInsertBefore}
                />
            );
            dropdownItems.push(
                <Dropdown.Item
                    key='insert-below'
                    icon='arrow circle down'
                    text='Insert cell below'
                    title={'Insert new notebook cell after cell #' + cellNumber}
                    onClick={this.handleInsertAfter}
                />
            );
            dropdownItems.push(<Dropdown.Divider key='div2'/>);
        }
        // Have a descriptive title that shows the user which cells will be
        // included in the new branch
        let branchRange = '1';
        if (cellNumber > 1) {
            branchRange += '-' + cellNumber;
        }
        dropdownItems.push(
            <Dropdown.Item
                key='branch'
                icon='fork'
                text='Create branch'
                title={'Create new branch containing notebook cells [' + branchRange + ']'}
                onClick={onCreateBranch}
            />
        );
        dropdownItems.push(
            <Dropdown.Item
                key='hide-cmd'
                icon='filter'
                text={'Hide ' + cell.commandSpec.name}
                title={'Hide all cells with command of type ' + cell.commandSpec.name + ' in the notebook'}
                onClick={onAddFilteredCommand}
            />
        );
        // The second section of the menu contains the available outputs. The
        // console output and the module timestamps are always available.
        // Datasets and views are optional.
        dropdownItems.push(<Dropdown.Divider key='div3'/>);
        dropdownItems.push(<Dropdown.Header key='output' content='Output' />);
        dropdownItems.push(<Dropdown.Divider key='div4'/>);
        dropdownItems.push(
            <Dropdown.Item
                key='console'
                icon='desktop'
                text='Console'
                title='Show standard output'
                disabled={selectedKey === 'console'}
                onClick={() => (onOutputSelect(module, CONTENT_TEXT))}
            />
        );
        dropdownItems.push(
            <Dropdown.Item
                key='hide'
                icon='hide'
                text='Hide'
                title='Hide output for this cell'
                disabled={selectedKey === null}
                onClick={() => (onOutputSelect(module, CONTENT_HIDE))}
            />
        );
        dropdownItems.push(
            <Dropdown.Item
                key='timestamps'
                icon='clock outline'
                text='Timing'
                title='Show module execution times'
                disabled={selectedKey === 'timestamps'}
                onClick={() => (onOutputSelect(module, CONTENT_TIMESTAMPS))}
            />
        );
        // Show dataset options if datasets are present in output
        if (module.datasets.length > 0) {
            dropdownItems.push(<Dropdown.Divider key='div5'/>);
            for (let i = 0; i < module.datasets.length; i++) {
                const ds = module.datasets[i];
                dropdownItems.push(
                    <Dropdown.Item
                        key={'ds-' + ds.name}
                        icon='table'
                        text={ds.name}
                        title={'Show dataset ' + ds.name}
                        disabled={selectedKey === 'ds-' + ds.name}
                        onClick={() => (onOutputSelect(module, CONTENT_DATASET, ds.name))}
                    />
                );
            }
        }
        // Show chart options if chart views are present in output
        if (module.charts.length > 0) {
            dropdownItems.push(<Dropdown.Divider key='div6'/>);
            for (let i = 0; i < module.charts.length; i++) {
                const chart = module.charts[i];
                dropdownItems.push(
                    <Dropdown.Item
                        key={'vw-' + chart.name}
                        icon='bar chart'
                        text={chart.name}
                        title={'Show chart ' + chart.name}
                        disabled={selectedKey === 'vw-' + chart.name}
                        onClick={() => (onOutputSelect(module, CONTENT_CHART, chart.name))}
                    />
                );
            }
        }
        return (
            <div className='cell-menu'>
                <Dropdown icon='bars' title='Cell actions and output'>
                    <Dropdown.Menu>{dropdownItems}</Dropdown.Menu>
                </Dropdown>
            </div>
        );
    }
}

export default CellDropDownMenu;
