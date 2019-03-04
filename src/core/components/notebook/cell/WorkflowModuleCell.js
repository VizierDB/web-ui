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
import CellCommandText from './CellCommandText';
import CellIndex from './CellIndex';
import '../../../../css/Notebook.css';


/**
 * Cell in a notebook for an existing module in a curation workflow. Displays
 * the cell index, cell command text or module input form and the cell output
 * area.
 */
class WorkflowModuleCell extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        cellIndex: PropTypes.number.isRequired,
        notebook: PropTypes.object.isRequired,
        onCreateBranch: PropTypes.func.isRequired
    }
    render() {
        const { cell, cellIndex, notebook, onCreateBranch } = this.props;
        const { state, text } = cell.module;
        // Cell index widget
        let indexWidget = null;
        let onClick = null;
        if (notebook.readOnly) {
            onClick = () => (onCreateBranch(cell.module));
            indexWidget = (
                <CellIndex
                    cell={cell}
                    cellIndex={cellIndex}
                    onClick={onClick}
                    title='Create new branch at this cell'
                />
            );
        } else {
            onClick = () => (alert('Click'));
            indexWidget = (
                <CellIndex
                    cell={cell}
                    cellIndex={cellIndex}
                    onClick={onClick}
                    title='Create new branch at this cell'
                />
            );
        }
        // Cell command widget
        let cellCommand = (<CellCommandText moduleState={state} text={text} onDoubleClick={onClick} />);
        return (
            <div>
                <table className='cell-area'><tbody>
                    <tr>
                        <td className='cell-index'>{indexWidget}</td>
                        <td className='cell-cmd'>
                            {cellCommand}
                        </td>
                    </tr>
                </tbody></table>
            </div>
        );
    }
}

export default WorkflowModuleCell;
