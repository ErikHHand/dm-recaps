import React, { Component } from 'react';

import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import Badge from 'react-bootstrap/Badge'
import Form from 'react-bootstrap/Form';

import { TYPES } from '../../constants/types.js';
import { ICONS } from '../../constants/types.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

import { withFirebase } from '../Firebase/Firebase';


const INITIAL_STATE = {
	searchText: '',
};

/*
	This component holds the filter/search bar for tags. It is used both
	for the tag list on the tags page, and in the tag selector pop-up.
*/
class TagFilter extends Component {
	constructor(props) {
		super(props);

		this.inputReference = React.createRef();
	  
		this.state = {
			...INITIAL_STATE,
			focus: true,
			typeFilter: "All",
			textFilter: "",
			numTags: 0,
		};

		// Set the context for "this" for the following functions
		this.textFilter = this.textFilter.bind(this);
		this.filter = this.filter.bind(this);
	}

	// Create initial list of tags shown
	componentDidMount() {
		if(this.props.campaign.tags) {
			this.filterKeys();
		}
	}

	componentDidUpdate(prevProps) {

		//console.log(prevProps.focus);

		// Check if filter should be updated based on changes from other components
		if (this.props.tagSort !== prevProps.tagSort) {
			// Sorting order has changed
			this.filterKeys();
		} else if (this.state.numTags !== Object.keys(this.props.campaign.tags).length) {
			// The number of tags has changed, from adding or deleting tags
			this.filterKeys();	
		}

		if (this.props.focus && window.innerWidth >= 768) {
			this.inputReference.current.focus();
		}
	}
	
	// Update text filter value and filter tags directly after
	textFilter(event) {
		event.preventDefault();
		
		this.setState({
			searchText: event.target.value,
			textFilter: event.target.value.toLowerCase(),
		}, this.filterKeys);
	}

	// Update type filter value and filter tags directly after
	typeFilter(value) {	
		this.setState({
			typeFilter: value,
		}, this.filterKeys);
	}

	// Filter the tags and return a list of filtered tag keys to
	// the parent component
	filterKeys() {
		let keys = Object.keys(this.props.campaign.tags);

		// Save number of tags in state for future comparisons
		this.setState({
			numTags: keys.length,
		})

		let sortedKeys;

		// Filter results if there is a text filter present or type filter is not "All"
		if(this.state.textFilter || this.state.typeFilter !== "All") {
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
				return ((this.props.campaign.tags[b].name.toLowerCase() <= this.props.campaign.tags[a].name.toLowerCase()) ? 1 : -1);
			});
		}

		this.props.handleFilteredTags(sortedKeys);
	}

	// The function used for filtering
	// It checks for occurance of the text from the text filter in both the tag name and the tag description
	// It uses the type filter to match with the tag type, if type filter valut is not "All"
	filter(key, index, keys) {
		let textFilter = this.props.campaign.tags[key].name.toLowerCase().includes(this.state.textFilter);
		let textDescriptionFilter = this.props.campaign.tags[key].description.toLowerCase().includes(this.state.textFilter);
		let typeFilter = this.state.typeFilter !== "All" ? this.props.campaign.tags[key].type === this.state.typeFilter : true;
		return (textFilter || textDescriptionFilter) && typeFilter;
	}

	render() {

		const {
			searchText,
		} = this.state;

		// The dropdown list where a type for the filter is selected
		let typeFilterItems = Object.keys(TYPES).map((type) => 
			<Dropdown.Item key={type} onClick = {() => this.typeFilter(type)}>
				<Badge 
					pill 
					className = "select-type"
					bg="bullshit"
				>
					<FontAwesomeIcon icon={ICONS[type]} />
					&nbsp;
					{TYPES[type]}
				</Badge>
			</Dropdown.Item>
		);

		// The icon shown as the currently filtered type
		let currentTypeFilter = "";
		if(this.state.typeFilter === "All") {
			currentTypeFilter = <FontAwesomeIcon icon={faFilter}/>
		} else {
			currentTypeFilter = <FontAwesomeIcon icon={ICONS[this.state.typeFilter]}/>
		}

		return (
			<>
				<div className="remove-padding filter-field">
					<Form onSubmit={e => e.preventDefault()}>
						<Form.Group controlId="searchInput">
							<Form.Control
								ref={this.inputReference}
								name="tagSearch"
								value={searchText}
								type="search"
								onChange={this.textFilter}
								placeholder="Search..."
							/>
						</Form.Group>
					</Form>
				</div>
				<div className="filter-type-button">
					<DropdownButton variant="outline-secondary" title={currentTypeFilter} size="my-sm">
						<Dropdown.Item onClick = {() => this.typeFilter("All")}>
							<Badge
								pill 
								className = "select-type"
								bg="bullshit"
							>
								<FontAwesomeIcon icon={faFilter} />
								&nbsp;
								All
							</Badge>
						</Dropdown.Item>
						{typeFilterItems}
					</DropdownButton>
				</div> 
			</>
		);
	}
}

export default withFirebase(TagFilter)