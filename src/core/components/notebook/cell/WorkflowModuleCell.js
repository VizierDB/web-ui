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
import { Button, Dropdown, Icon, Menu } from 'semantic-ui-react';
import CellCommandText from './CellCommandText';
import CellMenu from './CellMenu';
import CellOutputArea from './output/CellOutputArea';
import '../../../../css/Notebook.css';


/**
 * Cell in a notebook for an existing module in a curation workflow. Displays
 * the cell index, cell command text or module input form and the cell output
 * area.
 */
class WorkflowModuleCell extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        cellNumber: PropTypes.number.isRequired,
        notebook: PropTypes.object.isRequired,
        onCreateBranch: PropTypes.func.isRequired,
        onOutputSelect: PropTypes.func.isRequired
    }
    /**
     * Event handler when the user clicks the menu item to create a new branch
     * up until the module in this cell.
     */
    handleCreateBranch = () => {
        const { cell, onCreateBranch, onOutputSelect } = this.props;
        onCreateBranch(cell.module);
    }
    handleEditCell = () => {
        alert('Edit')
    }
    render() {
        const { cell, cellNumber, notebook, onOutputSelect } = this.props;
        const outputArea = (
                <CellOutputArea
                    cell={cell}
                    onNavigateDataset={() => (alert('Navigate'))}
                    onOutputSelect={onOutputSelect}
                    onShowAnnotations={() => (alert('Annotations'))}

                />
            );
        // The default action when the user double clicks on the cell command
        // depends on whether the notebook is read-only or not. For read-only
        // notebooks 'Create branch' is the default option. Otherwise it is
        // 'Edit cell'.
        let onDefaultAction = null;
        if (notebook.readOnly) {
            onDefaultAction = this.handleCreateBranch;
        } else {
            onDefaultAction = this.handleEditCell;
        }
        return (
            <table className='cell'><tbody>
                <tr>
                    <td className='cell-index'>
                        <span className='cell-index'>[{cellNumber}]</span>
                    </td>
                    <td>
                        <div className='cell-area'>
                            <table className='cell-area'><tbody>
                                <tr>
                                    <td className='cell-menu'>
                                        <CellMenu
                                            cell={cell}
                                            cellNumber={cellNumber}
                                            notebook={notebook}
                                            onCreateBranch={this.handleCreateBranch}
                                            onOutputSelect={onOutputSelect}
                                        />
                                    </td>
                                    <td className='cell-cmd'>
                                        <CellCommandText
                                            cell={cell}
                                            onDoubleClick={onDefaultAction}
                                        />
                                    </td>
                                </tr>
                            </tbody></table>
                            { outputArea }
                        </div>
                    </td>
                </tr>
            </tbody></table>
        );
    }
}

export default WorkflowModuleCell;
