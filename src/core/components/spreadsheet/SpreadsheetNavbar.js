/**
 * Navigation button for spreadsheet.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'
import '../../../css/Spreadsheet.css'


class SpreadsheetDownload extends React.Component {
    static propTypes = {
        url: PropTypes.string.isRequired
    }
    handleDownload = () => {
        const { url } = this.props
        window.open(url)
    }
    render() {
        return (
            <Button
                icon='download'
                onClick={this.handleDownload}
            />
        )
    }
}


class SpreadsheetNavigate extends React.Component {
    static propTypes = {
        icon: PropTypes.string.isRequired,
        url: PropTypes.string,
        spreadsheet: PropTypes.object.isRequired
    }
    handleClick = () => {
        const { url, spreadsheet } = this.props
        spreadsheet.navigate(url)
    }
    render() {
        const { icon, url } = this.props
        return (
            <Button
                icon={icon}
                disabled={url === undefined}
                onClick={this.handleClick}
            />
        )
    }
}

class SpreadsheetNavbar extends React.Component {
    render() {
        const { dataset, container } = this.props
        return (
            <div>
                <Button.Group>
                    <SpreadsheetNavigate
                        icon='fast backward'
                        url={dataset.links.pagefirstanno}
                        spreadsheet={container}
                    />
                    <SpreadsheetNavigate
                        icon='chevron left'
                        url={dataset.links.pageprevanno}
                        spreadsheet={container}
                    />
                    <SpreadsheetNavigate
                        icon='chevron right'
                        url={dataset.links.pagenextanno}
                        spreadsheet={container}
                    />
                    <SpreadsheetNavigate
                        icon='fast forward'
                        url={dataset.links.pagelastanno}
                        spreadsheet={container}
                    />
                </Button.Group>
                <span className='left-padding-lg'>
                    <SpreadsheetDownload url={dataset.links.download} />
                </span>
            </div>
        )

    }
}

export default SpreadsheetNavbar
