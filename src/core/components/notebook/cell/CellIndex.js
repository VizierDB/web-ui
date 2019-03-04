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
import { PropTypes } from 'prop-types'
import { isErrorOrCanceled }  from '../../../resources/Workflow';
import '../../../../css/Notebook.css';


/**
 * Display the index for a notebook cell. The displayed value is the index
 * number of a notebook cell. The index is clickable if the onClick function
 * is given.
 */
class CellIndex extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        cellIndex: PropTypes.number.isRequired,
        onClick: PropTypes.func,
        title: PropTypes.string
    }
    render() {
        const { cell, cellIndex, title, onClick } = this.props;
        const { state } = cell.module;
        // The stylesheet class name depends on the state of the module. Append
        // error-state in case of an error or if the module was canceled.
        let css = 'cell-index';
        if (isErrorOrCanceled(state)) {
            css += ' error-state';
        }
        // Depending on whether the onClick method is given the cell index is
        // rendered as a clickable link or a simple text.
        let cellIndexValue = null;
        if (onClick != null) {
            cellIndexValue = (
                <a className={css} title={title} onClick={onClick}>
                    {cellIndex}
                </a>
            );
        } else {
            cellIndexValue = cellIndex;
        }
        // Encapsulate the cell index in square brackets
        return (
            <span className={css}>[{cellIndexValue}]</span>
        );
    }
}

export default CellIndex;
