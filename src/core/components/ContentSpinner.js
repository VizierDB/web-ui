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
