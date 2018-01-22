/**
 * Dropdown menu for spreadsheet.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'
import '../../../css/Spreadsheet.css'


class SpreadsheetDownload extends React.Component {
    static propTypes = {
        downloadUrl: PropTypes.string.isRequired
    }
    handleDownload = () => {
        const { downloadUrl } = this.props
        window.open(downloadUrl)
    }
    render() {
        return (
            <div className='centered-button'>
                <Button
                    size='mini'
                    circular
                    icon='download'
                    onClick={this.handleDownload}
                />
            </div>
        )
    }
}

export default SpreadsheetDownload
