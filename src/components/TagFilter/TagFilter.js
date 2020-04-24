import React, { Component } from 'react';

import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import SearchField from "react-search-field";

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This component holds the filter/search bar in the tag page
*/
class TagFilter extends Component {
	constructor(props) {
		super(props);
	  
		this.state = {
			textFilter: "",
		};

		// Set the context for "this" for the following functions
		this.textFilter = this.textFilter.bind(this);
		this.filter = this.filter.bind(this);

		if(this.props.campaign.tags) {
			this.filterKeys();
		}
	}

	componentDidUpdate(prevProps) {
	
		if (this.props.tagSort !== prevProps.tagSort) {
			this.filterKeys();
		} else if(this.props.campaign && !prevProps.campaign.tags) {
			// Handles case when site mounts and tags is still in a promise
			this.filterKeys();
		} else if(this.props.campaign && prevProps.campaign.tags) {
			if(Object.keys(this.props.campaign.tags).length !== this.props.filteredTags.length) {
				this.filterKeys();
			}
		}
	}
	  
	textFilter(value, event) {
		event.preventDefault();
		
		this.setState({
			textFilter: value.toLowerCase(),
		}, this.filterKeys);
	}

	typeFilter(value) {		
		this.setState({
			typeFilter: value,
		}, this.filterKeys);
	}

	filterKeys() {
		if(this.props.campaign) {
			let keys = Object.keys(this.props.campaign.tags);
			let sortedKeys;

			// Filter results
			if(this.state.textFilter) {
				keys = keys.filter((key, index, keys) => this.filter(key, index, keys));
			}

			if(this.props.tagSort < 3) {
				// Sort keys in date order, meaning tags created more recently will appear higher up
				sortedKeys = keys.sort((a, b) => {				
					return this.props.campaign.tags[b].created.toDate() - this.props.campaign.tags[a].created.toDate();
				});
				
			} else {
				// Sort keys in alphabetical order based on tag names
				sortedKeys = keys.sort((a, b) => {				
					return ((this.props.campaign.tags[b].name <= this.props.campaign.tags[a].name) ? 1 : -1);
				});
			}

			this.props.handleFilteredTags(sortedKeys);
		}
	}

	filter(key, index, keys) {
		let textFilter = this.props.campaign.tags[key].name.toLowerCase().startsWith(this.state.textFilter);
		return textFilter;
	}


	render() {
		return (
			<>
				<div className="remove-padding filter-field">
					<SearchField
						placeholder="Search..."
						onChange={(value, event) => this.textFilter(value, event)}
						searchText=""
					/>
				</div>
				<div className="filter-type-button">
					<DropdownButton variant="outline-secondary" title="All" size="my-sm">
						<Dropdown.Item>Action</Dropdown.Item>
						<Dropdown.Item>Another action</Dropdown.Item>
						<Dropdown.Item>Something else</Dropdown.Item>
					</DropdownButton>
				</div>
			</>
		);
	}
}

export default withFirebase(TagFilter)