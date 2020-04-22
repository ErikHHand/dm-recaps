import React, { Component } from 'react';

import RecapItem from '../RecapItem/RecapItem';
import TagItem from '../TagItem/TagItem';
import TagInfo from '../TagInfo/TagInfo';
import SortArrowsColumn from '../SortArrowsColumn/SortArrowsColumn';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'

import SearchField from "react-search-field";

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This component holds the tags tab of the App. This component also
	handles which tag item is selected.
*/
class TagsPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			showTagInfo: false,
			selectedTag: null,
			edit: false,
			tagSort: 1,
			recapSortDescending: false,
			textFilter: "",
		};

		// Set the context for "this" for the following function
		this.handleSelectedTag = this.handleSelectedTag.bind(this);
		this.editTag = this.editTag.bind(this);
		this.addTag = this.addTag.bind(this);
		this.changeSort = this.changeSort.bind(this);
		this.textFilter = this.textFilter.bind(this);
		this.filter = this.filter.bind(this);
	}

	// Handles changing which tag is the current tag,
	// which tag is currently selected
	handleSelectedTag(tagID) {
		this.setState({
			selectedTag: tagID,
		})
	}

	// Triggers before editing a tag
	editTag(tagID, name, type, colour) {
		this.setState({
			tagID: tagID,
			name: name,
			type: type,
			colour: colour,
			edit: true,
			showTagInfo: true,
		});
	}

	// Triggers before adding a tag
	addTag() {
		this.setState({
			tagID: null,
			name: "",
			type: "Location",
			colour: "#415b39",
			edit: false,
			showTagInfo: true,
		});
	}

	changeSort(list, value) {
		if(value) {
			this.setState({
				[list]: value,
			});
		} else {
			this.setState({
				[list]: !this.state[list],
			});
		}
	}

	textFilter(value, event) {
		event.preventDefault();
		
		this.setState({
			textFilter: value.toLowerCase(),
		})
	}

	filter(key, index, keys) {
		let textFilter = this.props.campaign.tags[key].name.toLowerCase().startsWith(this.state.textFilter);
		return textFilter;
	}

	render() {

		let tagsPage = this;

		// Render tag items
		let tagItems;

		if(!this.props.campaign.tags) {
			tagItems = <div></div>; //Render nothing if there are no tags
		} else {

			let keys = Object.keys(this.props.campaign.tags);
			let sortedKeys;

			// Filter results
			if(this.state.textFilter) {
				keys = keys.filter((key, index, keys) => this.filter(key, index, keys));
			}

			if(this.state.tagSort < 3) {
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
			
			// based on sorting, reverse keys
			if(this.state.tagSort === 2 || this.state.tagSort === 3) {
				sortedKeys.reverse();
			}
			
			tagItems = sortedKeys.map((tag)=>
				<TagItem 
					key = {tag}
					tagID = {tag}
					tagInfo = {this.props.campaign.tags[tag]}
					campaign = {this.props.campaign}
					sessions = {this.props.sessions}
					tags = {this.props.tags}
					handleSessions = {this.props.handleSessions}
					handleTags = {this.props.handleTags}
					handleCampaign = {this.props.handleCampaign}
					handleSelectedTag = {this.handleSelectedTag}
					isSelected = {this.state.selectedTag === tag}
					handleClick = {() => tagsPage.setState({selectedTag: tag})}
					editTag = {this.editTag}
					campaignRef = {this.props.campaignRef}
				/>
			);
		}

		// Render recap items
		let recapItems;

		if(!this.state.selectedTag) {
			recapItems = <div></div>; // No current tag
		} else if(!this.props.tags[this.state.selectedTag]) {
			recapItems = <div></div>; // // Current tag doesn't exist?
		} else {

			let recapList = this.props.tags[this.state.selectedTag].recaps;
			let length = this.props.campaign.sessionOrder.length;
			let recapKeys = {};

			// Order recap items chronologically
			// First, give each recap item a number for sorting
			// Multiply session order by a large number to guarantee that is counted higher
			// than the recap order, which is added by as a small number
			for(let recapItem in recapList) {
				let session = this.props.campaign.sessions[recapList[recapItem].session];
				let sessionIndex = this.props.campaign.sessionOrder.indexOf(recapList[recapItem].session);
				recapKeys[recapItem] = (length - sessionIndex) * 100000 + session.recapOrder.indexOf(Number(recapItem));
			}			

			// Then sort keys
			let sortedKeys = Object.keys(recapKeys).sort((a, b) => {				
				return recapKeys[a] - recapKeys[b];
			});

			if(this.state.recapSortDescending) {
				sortedKeys.reverse();
			}

			recapItems = sortedKeys.map((recapID)=>
				<RecapItem 
					key = {recapID}
					recapID = {recapID}
					recapItem = {recapList[recapID]}
					campaign = {this.props.campaign}
					sessions = {this.props.sessions}
					tags = {this.props.tags}
					handleCampaign = {this.props.handleCampaign}
					handleSessions = {this.props.handleSessions}
					handleTags = {this.props.handleTags}
					campaignRef = {this.props.campaignRef}
				/>
			);
		}

		return (
			<Row noGutters={true}>
				<Col lg={3} md={4} className="remove-padding tag-bar">
					<Row noGutters={true} className="filter-and-search-bar border-bottom border-right">
						<Col xs={9} >
							<SearchField
								placeholder="Search..."
								onChange={(value, event) => this.textFilter(value, event)}
								searchText=""
								classNames="search-field"
							/>
						</Col>
						<Col xs={3}>
							<DropdownButton variant="outline-secondary" title="All" size="my-sm">
								<Dropdown.Item>Action</Dropdown.Item>
								<Dropdown.Item>Another action</Dropdown.Item>
								<Dropdown.Item>Something else</Dropdown.Item>
							</DropdownButton>
						</Col>
					</Row>
					<div className="border-bottom border-right tag-bar-lower">
						<SortArrowsColumn
							status = {this.state.tagSort}
							changeSort = {(value) => this.changeSort("tagSort", value)}
							alphabetical = {true}
						/>
						<div className="tag-item-list remove-scroll-bar">
							{tagItems}
						</div>
					</div>
					
					<div className="center">
						<Button variant="success" onClick={this.addTag}>New Tag</Button>
					</div>
					<TagInfo 
						show = {this.state.showTagInfo}
						onHide = {() => this.setState({ showTagInfo: false })}
						tags = {this.props.tags}
						campaign = {this.props.campaign}
						handleTags = {this.props.handleTags}
						handleCampaign = {this.props.handleCampaign}
						campaignRef = {this.props.campaignRef}
						edit = {this.state.edit}
						tagID = {this.state.tagID}
						name = {this.state.name}
						type = {this.state.type}
						colour = {this.state.colour}
					/>
				</Col>
				<Col lg={9} md={8} className="remove-padding recap-item-column border-bottom">
					<SortArrowsColumn
						status = {this.state.recapSortDescending}
						changeSort = {() => this.changeSort("recapSortDescending", null)}
						alphabetical = {false}
					/>
					<div className="recap-item-list remove-scroll-bar">
						{recapItems}
					</div>
				</Col>
			</Row>
		)
	}
}

export default withFirebase(TagsPage)