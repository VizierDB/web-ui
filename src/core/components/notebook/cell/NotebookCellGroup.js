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
import { Icon } from 'semantic-ui-react'
import { TextButton } from '../../../components/Button'
import { GRP_HIDE } from '../../../resources/Notebook';
import '../../../../css/Notebook.css';


/**
 * A grouping of notebook cells. Represents a list of grouped notebook cells.
 * Depending on the grouping mode either a divider is shown or a list of module
 * texts.
 */
class NotebookCellGroup extends React.Component {
    static propTypes = {
        cells: PropTypes.array.isRequired,
        endIndex: PropTypes.number.isRequired,
        errorState: PropTypes.bool.isRequired,
        groupMode: PropTypes.number.isRequired,
        startIndex: PropTypes.number.isRequired,
        onChangeGrouping: PropTypes.func.isRequired
    }
    /**
     * Depending on the state of the group mode a simple divider is shown or
     * a list of module texts.
     */
    render() {
        const {
            cells,
            endIndex,
            errorState,
            groupMode,
            startIndex,
            onChangeGrouping
        } = this.props;
        if (groupMode === GRP_HIDE) {
            let text = null;
            if (startIndex < endIndex) {
                text = '[VIZUAL CELLS ' + startIndex + '-' + endIndex + ']';
            } else {
                text = '[VIZUAL CELL ' + startIndex + ']';

            }
            let buttonCss = 'code-text';
            if (errorState) {
                buttonCss += '-err';
            }
            return (
                <div className='horizontal-divider'>
                    <TextButton
                        css={buttonCss}
                        text={text}
                        title='Show hidden cells'
                        onClick={onChangeGrouping}
                    />
                </div>
            );
        } else {
            // The cell index displays a link to toggle grouping
            const cellIndex = (
                <Icon
                    className='expand-button'
                    name='expand'
                    title='Expand collapsed cells'
                    onClick={onChangeGrouping}
                />
            );
            // Get the list of command lines for all the cells in  the output
            let lines = null;
            for (let i = 0; i < cells.length; i++) {
                const module = cells[i].module;
                if (lines !== null) {
                    lines += '\n';
                    lines += module.text;
                } else {
                    lines = module.text;
                }
            }
            // Set the cell style depending on the error state
            let cssPre = 'cell-vizual';
            let cssIndex = 'cell-index';
            if (errorState) {
                cssPre += '-error';
                cssIndex += '-error';
            }
            // The cell content is the list of module texts
            let cellCommand =  (
                <pre className={cssPre}>
                    {lines}
                </pre>
            );
            // Show the notebook cell
            let cellCss = 'notebook-cell-ro';
            if (errorState) {
                cellCss += '-error';
            }
            return (
                <div className={cellCss}>
                    <table className='cell-area'><tbody>
                        <tr>
                            <td className={cssIndex}>{cellIndex}</td>
                            <td className='cell-cmd'>
                                {cellCommand}
                            </td>
                        </tr>
                    </tbody></table>
                </div>
            );
        }
    }
}

export default NotebookCellGroup;
