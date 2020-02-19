import _ from 'lodash'
import React from 'react'
import { Search } from 'semantic-ui-react'
import PropTypes from 'prop-types';

const initialState = { isLoading: false, results: [], value: ''}

export default class SearchBar extends React.Component {
    static defaultProps = {
        aligned: 'right'
    }

    static propTypes = {
        aligned: PropTypes.string,
        projects: PropTypes.array.isRequired,
        handleShowProjectPage: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = initialState
        this.projects = this.addTitleFieldToProjects(this.props.projects)
    }

    addTitleFieldToProjects = (projects) => {
        if(projects != null && projects.length>0){
            const projectsClone = [...projects]
            for (let i = 0; i < projectsClone.length; i++) {
                projectsClone[i]["title"] = projectsClone[i]["name"]
            }
            return projectsClone
        }
        return []
    }

    handleResultSelect = (e, { result }) => {
        this.setState({ value: result.title })
        this.props.handleShowProjectPage(result)
    }

    handleSearchChange = (e, { value }) => {
        this.setState({ isLoading: true, value })

        setTimeout(() => {
            if (this.state.value.length < 1) return this.setState(initialState)

            const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
            const isMatch = (result) => re.test(result.title)

            this.setState({
                isLoading: false,
                results: _.filter(this.projects, isMatch),
            })
        }, 300)
    }

    render(){
        const { isLoading, value, results } = this.state

        return (
            <div align={this.props.aligned}>
                <Search
                    aligned={this.props.aligned}
                    loading={isLoading}
                    onResultSelect={this.handleResultSelect}
                    onSearchChange={this.handleSearchChange}
                    results={results}
                    value={value}
                    />
            </div>)
    }
}