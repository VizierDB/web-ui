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

import React from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'semantic-ui-react'
import '../../../css/Scrollbar.css'


/**
 * Buttons on the scrollbar.
 */
class ScrollButton extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool.isRequired,
        icon: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired
    }
    render() {
        const { enabled, icon, title } = this.props;
        // The button style depends on whether the button is enabled or
        // disabled
        let css = 'scroll-icon';
        let onClick = this.props.onClick;
        if (!enabled) {
            css += '-disabled';
            onClick = null;
        }
        return (
            <div className={css}>
                <Icon
                    disabled={!enabled}
                    name={icon}
                    onClick={onClick}
                    size='small'
                    title={title}
                />
            </div>
        );
    }
}

/**
 * Vertical scrollbar for spreadsheets. By now this is experimental. Allows to
 * navigate to (i) the beginning or the end of the spreadsheet, (ii) the next
 * or previous page, (iii) the next or previous row, or (iv) to a given row.
 *
 * At this point the scrollbar is rendered as a horizontal group of clickable
 * icons.
 */
class SpreadsheetScrollbar extends React.Component {
    static propTypes = {
        dataset: PropTypes.object.isRequired,
        onNavigate: PropTypes.func.isRequired,
        cellLimit: PropTypes.number.isRequired
    }
    constructor(props) {
        super(props);
        const { dataset, cellLimit } = props;
        this.state = {
            limit: cellLimit,
            maxValue: Math.max(0, dataset.rowCount - cellLimit)
        }
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        const { dataset, cellLimit } = this.props;
        const { limit, maxValue } = this.state;
        const m = Math.max(0, dataset.rowCount - cellLimit);
        if ((limit !== cellLimit || (maxValue !== m))){
            this.setState({
                limit: cellLimit,
                maxValue: Math.max(0, dataset.rowCount - cellLimit)
            })
        }
    }
    /**
     * Scroll to the beginning of the dataset.
     */
    handleNavigateFirstPage = () => {
        const { dataset, onNavigate } = this.props;
        onNavigate(dataset, 0, this.state.limit);
    }
    /**
     * Scroll to the end of the dataset.
     */
    handleNavigateLastPage = () => {
        const { dataset, onNavigate } = this.props;
        const { maxValue, limit } = this.state;
        onNavigate(dataset, maxValue, limit);
    }
    /**
     * Scroll one page down.
     */
    handleNavigateNextPage = () => {
        const { dataset, onNavigate } = this.props;
        const { maxValue, limit } = this.state;
        const offset = dataset.offset;
        onNavigate(dataset, Math.min(maxValue, offset + limit), limit)
    }
    /**
     * Scroll one row down.
     */
    handleNavigateNextRow = () => {
        const { dataset, onNavigate } = this.props;
        const { maxValue, limit } = this.state;
        const offset = dataset.offset;
        onNavigate(dataset, Math.min(maxValue, offset + 1), limit);
    }
    /**
     * Scroll one page up.
     */
    handleNavigatePreviousPage = () => {
        const { dataset, onNavigate } = this.props;
        const offset = dataset.offset;
        const limit = this.state.limit;
        onNavigate(dataset, Math.max(0, offset - limit), limit);
    }
    /**
     * Scroll one row up.
     */
    handleNavigatePreviousRow = () => {
        const { dataset, onNavigate } = this.props;
        const offset = dataset.offset;
        onNavigate(dataset, Math.max(0, offset - 1), this.state.limit);
    }
    render() {
        const { dataset } = this.props;
        const value = dataset.offset;
        const hasPrevious = (value !== 0);
        const hasNext = (value < this.state.maxValue);
        let scrollbar = null;
        if (hasPrevious || hasNext) {
            scrollbar = (
                <div>
                    <div className='vertical-scroll-top'>
                        <ScrollButton
                            enabled={hasPrevious}
                            icon='arrow up'
                            onClick={this.handleNavigateFirstPage}
                            title='First page'
                        />
                        <ScrollButton
                            enabled={hasPrevious}
                            icon='angle double up'
                            onClick={this.handleNavigatePreviousPage}
                            title='Previous page'
                        />
                        <ScrollButton
                            enabled={hasPrevious}
                            icon='caret up'
                            title='Previous row'
                            onClick={this.handleNavigatePreviousRow}
                        />
                    </div>
                    <div className='vertical-scroll-down'>
                        <ScrollButton
                            enabled={hasNext}
                            icon='caret down'
                            title='Next row'
                            onClick={this.handleNavigateNextRow}
                        />
                        <ScrollButton
                            enabled={hasNext}
                            icon='angle double down'
                            title='Next page'
                            onClick={this.handleNavigateNextPage}
                        />
                        <ScrollButton
                            enabled={hasNext}
                            icon='arrow down'
                            onClick={this.handleNavigateLastPage}
                            title='Last page'
                        />
                    </div>
                </div>
            );
        }
        return (
            <div className='vertical-scroll'>
            { scrollbar }
            </div>
        )
    }
}

export default SpreadsheetScrollbar
