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
import { Dropdown, Icon } from 'semantic-ui-react';
import { CONTENT_CHART, CONTENT_DATASET, CONTENT_HIDE, CONTENT_TEXT,
    CONTENT_TIMESTAMPS, INSERT_AFTER, INSERT_BEFORE } from '../../../resources/Notebook';
import '../../../../css/Notebook.css'


/**
 * Dropdown menu for a notebook cell. Contains set of operations that are
 * available for the cell as well as the cell output and resulting resources.
 */
class CellDropDownMenu extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        cellNumber: PropTypes.number.isRequired,
        isActiveCell: PropTypes.bool.isRequired,
        notebook: PropTypes.object.isRequired,
        onAddFilteredCommand: PropTypes.func.isRequired,
        onCreateBranch: PropTypes.func.isRequired,
        onInsertCell: PropTypes.func.isRequired,
        onOutputSelect: PropTypes.func.isRequired
    }
    /**
     * Insert new cell before the notebook cell that is associated with the
     * menu.
     */
    handleInsertBefore = () => {
        this.props.onInsertCell(INSERT_BEFORE);
    }
    /**
     * Insert new cell after the notebook cell that is associated with the menu.
     */
    handleInsertAfter = () => {
        this.props.onInsertCell(INSERT_AFTER);
    }
    render() {
        const {
            cell,
            cellNumber,
            isActiveCell,
            notebook,
            onAddFilteredCommand,
            onCreateBranch,
            onOutputSelect
        } = this.props;
        const { module, output } = cell;
        // If the cell is not the active cell the output depends on the cell
        // state. If the cell module is not in a success state an icon is
        // displayed. Otherwise, the result is null
        if (!isActiveCell) {
            let icon = null;
            if (cell.isCanceled()) {
                icon = (<Icon name='cancel' color='red' title='Canceled'/>);
            } else if (cell.isError()) {
                icon = (<Icon name='warning circle' color='red' title='Error' />);
            } else if (cell.isPending()) {
                icon = (<Icon name='hourglass half' title='Pending' />);
            } else if (cell.isRunning()) {
                icon = (<Icon name='circle notch' title='Running' />);
            }
            return (
                <div className='cell-menu'>
                { icon }
                </div>
            );
        }
        // Create list of dropdon menu items. The first section contains the
        // cell actions edit, delete, insert cell (above/below) create new
        // branch at this cell, and hide commands like this. If the notebook is
        // read-only only the last teo items are shown
        const dropdownItems = [];
        //dropdownItems.push(<Dropdown.Header key='cell' content={'Cell (#' + cellNumber + ')'} />);
        //dropdownItems.push(<Dropdown.Divider key='div1'/>);
        if (!notebook.readOnly) {
            dropdownItems.push(<Dropdown.Header key='header-cell' content="Cell"/>);
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
            dropdownItems.push(<Dropdown.Divider key='div-notebook'/>);
            dropdownItems.push(<Dropdown.Header key='header-notebook' content="Notebook"/>);
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
            dropdownItems.push(<Dropdown.Divider key='div-branch'/>);
        }
        // Have a descriptive title that shows the user which cells will be
        // included in the new branch
        dropdownItems.push(<Dropdown.Header key='header-branch' content="Branch"/>);
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
        dropdownItems.push(<Dropdown.Divider key='div-filter'/>);
        dropdownItems.push(<Dropdown.Header key='header-filter' content="Filter"/>);
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
        // Determine the key of the selected output to disable the respective
        // menu entry.
        let selectedKey = null;
        let selectedIcon = 'hide';
        if ((output.isText()) || (output.isHtml())) {
            selectedKey = 'console';
            selectedIcon = 'desktop';
        } else if (output.isTimestamps()) {
            selectedKey = 'timestamps';
            selectedIcon = 'clock outline';
        } else if (output.isDataset()) {
            selectedKey = 'ds-' + output.dataset.name;
            selectedIcon = 'table';
        } else if (output.isChart()) {
            selectedKey = 'vw-' + output.name;
            selectedIcon = 'bar chart';
        }
        let outputItems = [];
        outputItems.push(
            <Dropdown.Item
                key='console'
                icon='desktop'
                text='Console'
                title='Show standard output'
                disabled={selectedKey === 'console'}
                onClick={() => (onOutputSelect(module, CONTENT_TEXT))}
            />
        );
        outputItems.push(
            <Dropdown.Item
                key='hide'
                icon='hide'
                text='Hide'
                title='Hide output for this cell'
                disabled={selectedKey === null}
                onClick={() => (onOutputSelect(module, CONTENT_HIDE))}
            />
        );
        outputItems.push(
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
            outputItems.push(<Dropdown.Divider key='div-ds'/>);
            outputItems.push(<Dropdown.Header key='header-ds' content="Datasets"/>);
            for (let i = 0; i < module.datasets.length; i++) {
                const ds = module.datasets[i];
                outputItems.push(
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
            outputItems.push(<Dropdown.Divider key='div-vw'/>);
            outputItems.push(<Dropdown.Header key='header-vw' content="Charts"/>);
            for (let i = 0; i < module.charts.length; i++) {
                const chart = module.charts[i];
                outputItems.push(
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
                <Dropdown icon='bars' title='Cell actions'>
                    <Dropdown.Menu>{dropdownItems}</Dropdown.Menu>
                </Dropdown>
                <Dropdown icon={selectedIcon} title='Cell output'>
                    <Dropdown.Menu>{outputItems}</Dropdown.Menu>
                </Dropdown>
            </div>
        );
    }
}

export default CellDropDownMenu;
