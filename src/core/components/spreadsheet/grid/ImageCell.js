import React from 'react'

class ImageCell extends React.Component {
    render() {
        const { value } = this.props;
        let cellCss = 'grid-cell';
        let src = `data:image/png;base64,${value}`
        return (
            <td className={cellCss} >
                <img src={src} alt="image" height="100" width="100"/>
            </td>
        );
    }
}

export default ImageCell;