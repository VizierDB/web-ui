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
import { KEY, MOVE, valueOrDefault } from '../../../util/App';
import '../../../../css/Spreadsheet.css'


const CTRL_ID = 'spreadsheet_input_ctrl'


class GridInput extends React.Component {
    static propTypes = {
        cellValue: PropTypes.oneOfType([
             PropTypes.string,
             PropTypes.number
         ]),
         onMove: PropTypes.func.isRequired,
         onUpdate: PropTypes.func.isRequired
    };
    constructor(props) {
        super(props);
        // Keep the current value in the local state.
        const { cellValue } = props;
        this.state = { value: valueOrDefault(cellValue, '') };
    }
    componentDidMount() {
        const { value } = this.state;
        this.setFocus(value);
    }

    onKeyDown = (event) => {
        const { cellValue, onMove, onUpdate } = this.props;
        const {ctrlKey, keyCode, shiftKey} = event;
        if (keyCode === KEY.ENTER) {
            event.preventDefault();
            onMove(MOVE.DOWN);
        } else if (keyCode === KEY.TAB) {
            event.preventDefault();
            if (shiftKey) {
                onMove(MOVE.LEFT);
            } else {
                onMove(MOVE.RIGHT);
            }
        } else if (keyCode === KEY.UP) {
            event.preventDefault();
            onMove(MOVE.UP);
        } else if (keyCode === KEY.DOWN) {
            event.preventDefault();
            onMove(MOVE.DOWN);
        } else if (keyCode === KEY.ESC) {
            event.preventDefault();
            const defaultValue = valueOrDefault(cellValue, '');
            this.setState(
                { value: defaultValue },
                () => (this.setFocus(defaultValue))
            );
            onUpdate(defaultValue);
        } else if ((ctrlKey) && (keyCode === KEY.NULL)) {
            event.preventDefault();
            this.setState({ value: '', isNull: true });
            onUpdate(null);
        }
    }
    /**
     * Update the local state when value in text control changes.
     */
    onChange = (event) => {
        const { onUpdate } = this.props;
        const value = event.target.value;
        this.setState({ value });
        onUpdate(value);
    }
    /**
     * Set focus in text control and select he full value.
     */
    setFocus(value) {
        const el = document.getElementById(CTRL_ID);
        el.focus();
        // At the moment we select the full value. Could set the cursor to the
        // end alternatively.
        el.setSelectionRange(0, value.toString().length);
    }
    /**
     * Show a text control to edit the cell value.
     */
    render() {
        const { value } = this.state;
        return (
            <input
                className='spreadsheet-input'
                id={CTRL_ID}
                value={value}
                onKeyDown={this.onKeyDown}
                onChange={this.onChange}
            />
        );
    }
}

export default GridInput;
