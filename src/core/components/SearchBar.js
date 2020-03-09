import _ from 'lodash'
import React from 'react'
import { Search } from 'semantic-ui-react'
import PropTypes from 'prop-types';

/**
 * To return a search bar that filters results on the calling component
 * */
export default class SearchBar extends React.Component {
    static defaultProps = {
        aligned: 'right'
    }

    static propTypes = {
        aligned: PropTypes.string,
        projects: PropTypes.array.isRequired,
        filterProjectListing: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.initialState = { isLoading: false, results: [], value: ''}
        this.state = this.initialState
        this.projects = this.addTitleFieldToProjects(this.props.projects)
    }

    addTitleFieldToProjects = (projects) => {
        if(projects !== null && projects.length > 0){
            const projectsClone = [...projects]
            for (let i = 0; i < projectsClone.length; i++) {
                projectsClone[i]["title"] = projectsClone[i]["name"]
            }
            return projectsClone
        }
        return []
    }

    handleSearchChange = (e, { value }) => {
        this.setState({ isLoading: true, value })

        setTimeout(() => {
            if (this.state.value.length < 1) {
                this.setState(this.initialState)
                return this.props.filterProjectListing(this.projects, value)
            }

            const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
            const isMatch = (result) => re.test(result.title)
            this.setState({
                isLoading: false,
                results: _.filter(this.projects, isMatch),
            }, ()=> this.props.filterProjectListing(this.state.results))
        }, 300)
    }

    render(){
        const { isLoading, value, results } = this.state

        return (
            <div align={this.props.aligned}>
                <Search
                    aligned={this.props.aligned}
                    loading={isLoading}
                    onSearchChange={this.handleSearchChange}
                    results={results}
                    value={value}
                    open={false}
                    />
            </div>)
    }
}