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
import { INSERT_AFTER, INSERT_BEFORE } from '../../resources/Notebook';
import '../../../css/Notebook.css'
import { HATEOAS_MODULE_FREEZE, HATEOAS_MODULE_THAW } from '../../util/HATEOAS'

/**
 * Dropdown menu for a notebook cell. Displays two icons with dropdown menus.
 * The first menu contains operations that are available for the cell. The
 * second menu allows to change the content that is being displayed in the cell
 * output area.
 */
class CellDropDownMenu extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        cellNumber: PropTypes.number.isRequired,
        isActiveCell: PropTypes.bool.isRequired,
        isNewNext: PropTypes.bool.isRequired,
        isNewPrevious: PropTypes.bool.isRequired,
        notebook: PropTypes.object.isRequired,
        onAddFilteredCommand: PropTypes.func.isRequired,
        onCopyCell: PropTypes.func.isRequired,
        onCreateBranch: PropTypes.func.isRequired,
        onDeleteCell: PropTypes.func.isRequired,
        onInsertCell: PropTypes.func.isRequired,
        onSelectCell: PropTypes.func.isRequired,
        onFreezeCell: PropTypes.func.isRequired,
        onFreezeOneCell: PropTypes.func.isRequired,
        onThawCell: PropTypes.func.isRequired,
        onThawOneCell: PropTypes.func.isRequired,
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
            isNewNext,
            isNewPrevious,
            notebook,
            onAddFilteredCommand,
            onCopyCell,
            onCreateBranch,
            onDeleteCell,
            onSelectCell,
            onFreezeCell,
            onFreezeOneCell,
            onThawCell,
            onThawOneCell
        } = this.props;
        // If the cell is in pending or running state no menu is displayed. We
        // only show an icon that depicts the cell status.
        if (cell.isActive()) {
            let icon = null;
            if (cell.isPending()) {
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
                    disabled={isActiveCell}
                    icon='pencil'
                    text='Edit'
                    title={'Edit notebook cell #' + cellNumber}
                    onClick={onSelectCell}
                />
            );
            dropdownItems.push(
                <Dropdown.Item
                    key='copy'
                    disabled={isActiveCell}
                    icon='copy'
                    text='Copy'
                    title={'Copy command from notebook cell #' + cellNumber}
                    onClick={onCopyCell}
                />
            );
            dropdownItems.push(
                <Dropdown.Item
                    key='delete'
                    disabled={notebook.hasActiveCells()}
                    icon='trash'
                    text='Delete'
                    title={'Delete notebook cell #' + cellNumber}
                    onClick={onDeleteCell}
                />
            );
            dropdownItems.push(<Dropdown.Divider key='div-notebook'/>);
            dropdownItems.push(<Dropdown.Header key='header-notebook' content="Notebook"/>);
            dropdownItems.push(
                <Dropdown.Item
                    key='insert-above'
                    disabled={isNewPrevious}
                    icon='arrow circle up'
                    text='Insert cell above'
                    title={'Insert new notebook cell before cell #' + cellNumber}
                    onClick={this.handleInsertBefore}
                />
            );
            dropdownItems.push(
                <Dropdown.Item
                    key='insert-below'
                    disabled={isNewNext}
                    icon='arrow circle down'
                    text='Insert cell below'
                    title={'Insert new notebook cell after cell #' + cellNumber}
                    onClick={this.handleInsertAfter}
                />
            );
            if(cell.module.links.has(HATEOAS_MODULE_FREEZE)){
                dropdownItems.push(
                    <Dropdown.Item
                        key='freeze-this'
                        disabled={false}
                        icon='snowflake'
                        text='Freeze this cell'
                        title={'Freeze cell #' + cellNumber + ', temporarily removing it from the notebook'}
                        onClick={onFreezeOneCell}
                    />
                );
                dropdownItems.push(
                    <Dropdown.Item
                        key='freeze-below'
                        disabled={false}
                        icon='snowflake'
                        text='Freeze cells from here'
                        title={'Freeze cell #' + cellNumber + ' and subsequent cells, temporarily removing it from the notebook'}
                        onClick={onFreezeCell}
                    />
                );
            };
            if(cell.module.links.has(HATEOAS_MODULE_THAW)){
                dropdownItems.push(
                    <Dropdown.Item
                        key='thaw-this'
                        disabled={false}
                        icon='sun'
                        text='Thaw this cell'
                        title={'Thaw cell #' + cellNumber + ', returning it to the notebook and rerunning it'}
                        onClick={onThawOneCell}
                    />
                );
                dropdownItems.push(
                    <Dropdown.Item
                        key='thaw-above'
                        disabled={false}
                        icon='sun'
                        text='Thaw cells up to here'
                        title={'Thaw cell #' + cellNumber + ' and preceding cells, returning them to the notebook and rerunning it'}
                        onClick={onThawCell}
                    />
                );
            };
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
                disabled={notebook.hasActiveCells()}
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
        // If the cell is in an error state we show an additional icon that
        // depicts the cell status
        let cellStatusIcon = null;
        if (cell.isErrorOrCanceled()) {
            if (cell.isCanceled()) {
                cellStatusIcon = (<Icon name='cancel' color='red' title='Canceled'/>);
            } else if (cell.isError()) {
                cellStatusIcon = (<Icon name='warning circle' color='red' title='Error' />);
            }
            cellStatusIcon = (
                <div className='cell-status-icon'>{ cellStatusIcon }</div>
            );
        }
        return (
            <div>
                <div className='cell-menu'>
                    <Dropdown icon='bars' title='Cell actions'>
                        <Dropdown.Menu>{dropdownItems}</Dropdown.Menu>
                    </Dropdown>
                </div>
                { cellStatusIcon }
            </div>
        );
    }
}

export default CellDropDownMenu;
