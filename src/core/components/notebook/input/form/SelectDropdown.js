/**
 * Dropdown selector for text values
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'


class SelectDropdown extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        options: PropTypes.array.isRequired,
        value: PropTypes.string,
        onChange: PropTypes.func.isRequired
    }
    render() {
        const { id, onChange, options, value } = this.props
        let selectedValue = value;
        const listing = [];
        for (let i = 0; i < options.length; i++) {
            const entry = options[i];
            // Check whether the entry is a structired value or a string
            if (typeof entry === 'object') {
                // A structured value is expected to have at least a .value
                // element. Other optional elements are .key and .isDefault
                let entryKey = null;
                if (entry.key) {
                    entryKey = entry.key;
                } else {
                    entryKey = entry.value;
                }
                if ((entry.isDefault) && (selectedValue == null)) {
                    selectedValue = entry.value;
                }
                listing.push({
                    key: entryKey,
                    text: entry.value,
                    value: entryKey
                })
            } else {
                // Assumes entry to be a scalar (string) value
                listing.push({
                    key: entry,
                    text: entry,
                    value: entry
                })
            }
        }
        return <Dropdown
                text={selectedValue}
                name={id}
                selection
                scrolling
                fluid
                options={listing}
                onChange={onChange}
            />;
    }
}

export default SelectDropdown;
