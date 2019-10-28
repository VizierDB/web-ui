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
 * Dataset Menu: Contains a list of all active datasets in the selected
 * workflow version.
 */

class DatasetCaveatMenuDropdown extends React.Component {
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
            const disabled = resource.isDatasetCaveat();
            // Set onClick handler to null if disabled
            let onClickHandler = null;
            if (!disabled) {
                onClickHandler = this.handleSelect;
            }
            return (
                <Menu.Item
                    key={ds.name}
                    icon='warning sign'
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
                if (resource.isDatasetCaveat()) {
                    disabled = resource.content.name === ds.name;
                }
                if (!disabled) {
                    hasSelectableItems = true;
                }
                menuItems.push(
                    <Dropdown.Item
                        key={ds.name}
                        icon='warning sign'
                        text={ds.name}
                        value={ds.name}
                        disabled={disabled}
                        onClick={this.handleSelect}
                    />
                );
            }
            return (
                <Dropdown item text='Caveats' disabled={!hasSelectableItems}>
                    <Dropdown.Menu>
                        { menuItems }
                    </Dropdown.Menu>
                </Dropdown>
            );
        }
    }
}

export default DatasetCaveatMenuDropdown;
