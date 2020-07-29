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
import FontAwesome from 'react-fontawesome';
import 'font-awesome/css/font-awesome.css';
import '../../css/Button.css';
import { Divider, Icon } from 'semantic-ui-react'

/**
 * Module containing a collection of different button comonents for the UI.
 */

/**
 * Clickable icon button using Font Awesome icons.
 */
export const IconButton = ({name, onClick, title}) => (
    <FontAwesome className="icon-button" name={name} onClick={onClick} title={title}/>
)

IconButton.propTypes = {
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string
};


/**
 * Clickable icon button using Font Awesome icons.
 */
export const CloseButton = ({name, onClick}) => (
    <FontAwesome className="close-button" name={name} onClick={onClick} />
)

CloseButton.propTypes = {
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
};


export const LargeMessageButton = ({message, icon, css, onClick, title, caption, captionIcon}) => {

    let mainMessage = <div>
        <p className='lg-message'>{message}</p>
        <p className='lg-button'>
            <IconButton name={icon + ' fa-4x'} title={title} onClick={onClick}/>
        </p>
    </div>;

    let captionMessage = caption !== null ? <div>
        <Divider horizontal>
            <p className='lg-button'>
                <Icon size="big" name={captionIcon} style={{margin:0}}/>
            </p>
        </Divider>
        <p className='lg-message'>{caption}</p>
    </div> : null;

    return(<div>
            <div className={css}>
              {mainMessage}
            </div>
            {captionMessage}
    </div>)
};

LargeMessageButton.propTypes = {
    css: PropTypes.string,
    icon: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string,
    caption: PropTypes.string,
    captionIcon: PropTypes.string
};


/**
 * Text button shows a clickable text.
 */

export class TextButton extends React.Component {
    static propTypes = {
        css: PropTypes.string,
        text: PropTypes.string.isRequired,
        title: PropTypes.string,
        onClick: PropTypes.func.isRequired
    }
    render() {
        const { css, text, title, onClick } = this.props;
        let linkCss = null;
        if (css != null) {
            linkCss = css;
        } else {
            linkCss = 'icon-button';
        }
        return (
            <a className={linkCss} title={title} onClick={onClick}>
                {text}
            </a>
        );
    }
}
