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
import '../../../../css/App.css';


/**
 * Simple helper component to format a module timestamp for output.
 */
class TimestampOutput extends React.Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        time: PropTypes.string,
    }
    /**
     * Show simple concatenation of label and time value. If the time is null
     * the component also return null.
     */
    render() {
        const { label, time } = this.props;
        if (time != null) {
            return (
                <pre className='plain-text'>
                    <span className='info-bold'>{label + ' '}</span>
                    {time}
                </pre>
            );
        } else {
            return null;
        }
    }
}

export default TimestampOutput;
