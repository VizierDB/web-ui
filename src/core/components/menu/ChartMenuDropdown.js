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
import { Dropdown, Menu } from 'semantic-ui-react';

/**
 * Chart Menu: Contains a list of all active datasets in the selected dataset
 * chart views version.
 */

class ChartMenuDropdown extends React.Component {
    static propTypes = {
        charts: PropTypes.array.isRequired,
        onSelect: PropTypes.func.isRequired,
        resource: PropTypes.object.isRequired
    }
    /**
     * Find the chart with the given name when the user clicks on a menu
     * item. The call onSelect method to show the chart.
     */
    handleSelect = (e, {value}) => {
        const { charts, onSelect } = this.props;
        for (let i = 0; i < charts.length; i++) {
            const chart = charts[i];
            if (chart.name === value) {
                onSelect(chart);
                break;
            }
        }
    }
    render() {
        const { charts, resource } = this.props;
        // Show nothing if the list of charts is empty
        if (charts.length === 0) {
            return null;
        } else if (charts.length === 1) {
            const chart = charts[0];
            const disabled = resource.isChart();
            // Set onClick handler to null if disabled
            let onClickHandler = null;
            if (!disabled) {
                onClickHandler = this.handleSelect;
            }
            return (
                <Menu.Item
                    key={chart.name}
                    icon='bar chart'
                    name={chart.name}
                    value={chart.name}
                    disabled={disabled}
                    onClick={onClickHandler}
                />
            );
        } else {
            // List of charts. Keep track whether there are any selectable items.
            // Otherwise, disable the menu entry.
            let hasSelectableItems = false;
            let menuItems = [];
            for (let i = 0; i < charts.length; i++) {
                const chart = charts[i];
                let disabled = false;
                if (resource.isChart()) {
                    disabled = resource.content.name === chart.name;
                }
                if (!disabled) {
                    hasSelectableItems = true;
                }
                menuItems.push(
                    <Dropdown.Item
                        key={chart.name}
                        icon='bar chart'
                        text={chart.name}
                        value={chart.name}
                        disabled={disabled}
                        onClick={this.handleSelect}
                    />
                );
            }
            return (
                <Dropdown item text='Chart' disabled={!hasSelectableItems}>
                    <Dropdown.Menu>
                        { menuItems }
                    </Dropdown.Menu>
                </Dropdown>
            );
        }
    }
}

export default ChartMenuDropdown;
