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
import { Loader } from 'semantic-ui-react';
import '../../css/App.css';


/**
 * Show a spinner to indicate that content is being loaded. The size property
 * allows to specify the loader size. Currently, only medium or small are
 * suppoerted (the default is massive).
 */
class ContentSpinner extends React.Component {
    static propTypes = {
        size: PropTypes.string,
        text: PropTypes.string
    }
    render() {
        const { size, text } = this.props;
        // Default layout is massive
        let cssClass = 'spinner-padding-ms';
        let loaderSize = 'massive';
        if (size === 'medium') {
            cssClass = 'spinner-padding-lg';
            loaderSize = 'medium';
        } else if (size === 'small') {
            cssClass = 'spinner-padding-md';
            loaderSize = 'small';
        }
        return (
            <div className={cssClass}>
                <Loader inline active size={loaderSize}>
                    {text}
                </Loader>
            </div>
        );
    }
}

export default ContentSpinner;
