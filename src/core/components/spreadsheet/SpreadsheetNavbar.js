/**
 * Navigation button for spreadsheet.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'
import '../../../css/Spreadsheet.css'


const BUTTON_SIZE = 'tiny';


class SpreadsheetDownload extends React.Component {
    static propTypes = {
        disabled: PropTypes.bool.isRequired,
        url: PropTypes.string.isRequired
    }
    handleDownload = () => {
        const { url } = this.props
        window.open(url)
    }
    render() {
        const { disabled } = this.props;
        return (
            <Button
                disabled={disabled}
                icon='download'
                size={BUTTON_SIZE}
                onClick={this.handleDownload}
            />
        )
    }
}


class SpreadsheetNavigate extends React.Component {
    static propTypes = {
        disabled: PropTypes.bool.isRequired,
        icon: PropTypes.string.isRequired,
        url: PropTypes.string,
        onClick: PropTypes.func.isRequired
    }
    handleClick = () => {
        const { url, onClick } = this.props
        onClick(url)
    }
    render() {
        const { disabled, icon, url } = this.props
        return (
            <Button
                icon={icon}
                size={BUTTON_SIZE}
                disabled={(url === undefined) || (disabled)}
                onClick={this.handleClick}
            />
        )
    }
}

/**
 * Navigation bar for spreadsheets. Displays buttons to navigate spreadsheet
 * 'pages'.
 */
class SpreadsheetNavbar extends React.Component {
    static propTypes = {
        dataset: PropTypes.object.isRequired,
        disabled: PropTypes.bool.isRequired,
        onNavigate: PropTypes.func.isRequired
    }
    render() {
        const { dataset, disabled, onNavigate } = this.props
        return (
            <div>
                <Button.Group size={BUTTON_SIZE}>
                    <SpreadsheetNavigate
                        disabled={disabled}
                        icon='fast backward'
                        url={dataset.links.pagefirstanno}
                        onClick={onNavigate}
                    />
                    <SpreadsheetNavigate
                        disabled={disabled}
                        icon='chevron left'
                        url={dataset.links.pageprevanno}
                        onClick={onNavigate}
                    />
                    <SpreadsheetNavigate
                        disabled={disabled}
                        icon='chevron right'
                        url={dataset.links.pagenextanno}
                        onClick={onNavigate}
                    />
                    <SpreadsheetNavigate
                        disabled={disabled}
                        icon='fast forward'
                        url={dataset.links.pagelastanno}
                        onClick={onNavigate}
                    />
                </Button.Group>
                <span className='left-padding-lg'>
                    <SpreadsheetDownload
                        disabled={disabled}
                        url={dataset.links.download}
                    />
                </span>
            </div>
        )

    }
}

export default SpreadsheetNavbar
