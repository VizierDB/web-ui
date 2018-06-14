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
import { CloseButton } from '../../Button'
import CellInputArea from '../input/CellInputArea';
import CollapsedEmptyCellInput from '../input/CollapsedEmptyCellInput';
import '../../../../css/Notebook.css';


/**
 * An empty cell in a notebook. The cell is either collapsed or expanded. If
 * collapsed, only a divider and button is show. If expanded the user can select
 * a module type and submit a new workflow module.
 */
class EmptyNotebookCell extends React.Component {
    static propTypes = {
        datasets: PropTypes.array.isRequired,
        env: PropTypes.object.isRequired,
        nextModule: PropTypes.object,
        notebook: PropTypes.object.isRequired,
        onSubmit: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        this.state = {expanded: false}
    }
    /**
     * Handle cell collapse event.
     */
    handleCollapse = () => (this.setState({expanded: false}));
    /**
     * Handle cell expand event.
     */
    handleExpand = () => (this.setState({expanded: true}));
    /**
     * Handle command submit. Call the provided onSubmit method and pass along
     * the next module in the notebook (needed to get the Url for the submit
     * request).
     */
    handleSubmit = (command, data) => {
        const { nextModule, onSubmit } = this.props;
        onSubmit(command, data, nextModule);
    }
    /**
     * Show the notebook cell, depending on the internal state of the collapsed
     * flag.
     */
    render() {
        const { datasets, env, notebook } = this.props;
        const { expanded } = this.state;
        // The general output is different for collapsed empty cells. In this
        // case no cell frame is shown but simply a divider or a message button.
        if (!expanded) {
            return (
                <CollapsedEmptyCellInput
                    isEmptyNotebook={notebook.cells.length === 0}
                    onExpand={this.handleExpand}
                />
            );
        } else {
            const cellIndex = (
                <CloseButton
                    name='minus-square-o'
                    onClick={this.handleCollapse}
                />
            );
            const inputArea = (
                <table className='cell-area'><tbody>
                    <tr>
                        <td className='cell-index'>
                            {cellIndex}
                        </td>
                        <td className='cell-cmd'>
                            <div className='cell-form'>
                                <CellInputArea
                                    datasets={datasets}
                                    env={env}
                                    onSubmit={this.handleSubmit}
                                />
                            </div>
                        </td>
                    </tr>
                </tbody></table>
            );
            let cellCss = 'notebook-cell';
            if (expanded) {
                cellCss += '-xp-new';
            }
            return (
                <div className={cellCss}>
                    { inputArea }
                </div>
            )
        }
    }
}

export default EmptyNotebookCell;
