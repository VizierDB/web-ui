/**
 * Chart Menu: Contains a list of all active datasets in the selected dataset
 * chart views version.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Menu } from 'semantic-ui-react';


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
