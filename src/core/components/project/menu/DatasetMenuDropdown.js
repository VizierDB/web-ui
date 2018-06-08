/**
 * Dataset Menu: Contains a list of all active datasets in the selected
 * workflow version.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Menu } from 'semantic-ui-react';


class DatasetMenuDropdown extends React.Component {
    static propTypes = {
        datasets: PropTypes.array.isRequired,
        onSelect: PropTypes.func.isRequired,
        resource: PropTypes.object.isRequired
    }
    /**
     * Find selected dataset and call onSelect handler.
     */
    handleSelect = (e, { value }) => {
        const { datasets, onSelect } = this.props;
        for (let i = 0; i < datasets.length; i++) {
            const ds = datasets[i];
            if (ds.name === value) {
                onSelect(ds);
                break;
            }
        }
    }
    render() {
        const { datasets, resource } = this.props;
        // Show nothing if the list of datasets is empty
        if (datasets.length === 0) {
            return null;
        } else if (datasets.length === 1) {
            const ds = datasets[0];
            const disabled = resource.isDataset();
            // Set onClick handler to null if disabled
            let onClickHandler = null;
            if (!disabled) {
                onClickHandler = this.handleSelect;
            }
            return (
                <Menu.Item
                    key={ds.name}
                    icon='table'
                    name={ds.name}
                    value={ds.name}
                    disabled={disabled}
                    onClick={onClickHandler}
                />
            );
        } else {
            // List of datasets. Keep track whether there are any selectable
            // items. Otherwise, disable the menu entry.
            let hasSelectableItems = false;
            let menuItems = [];
            for (let i = 0; i < datasets.length; i++) {
                const ds = datasets[i];
                let disabled = false;
                if (resource.isDataset()) {
                    disabled = resource.content.name === ds.name;
                }
                if (!disabled) {
                    hasSelectableItems = true;
                }
                menuItems.push(
                    <Dropdown.Item
                        key={ds.name}
                        icon='table'
                        text={ds.name}
                        value={ds.name}
                        disabled={disabled}
                        onClick={this.handleSelect}
                    />
                );
            }
            return (
                <Dropdown item text='Dataset' disabled={!hasSelectableItems}>
                    <Dropdown.Menu>
                        { menuItems }
                    </Dropdown.Menu>
                </Dropdown>
            );
        }
    }
}

export default DatasetMenuDropdown;
