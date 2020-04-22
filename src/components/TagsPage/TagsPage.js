import React, { Component } from 'react';

import RecapItem from '../RecapItem/RecapItem';
import TagItem from '../TagItem/TagItem';
import TagInfo from '../TagInfo/TagInfo';
import TagFilter from '../TagFilter/TagFilter';
import SortArrowsColumn from '../SortArrowsColumn/SortArrowsColumn';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';

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
			edit: false,
			recapSortDescending: false,
			selectedTag: null,
			showTagInfo: false,
			tag: {name: "", description: "", type: "Location", colour: "#415b39"},
			tagKeys: [],
			tagSort: 1,
			textFilter: "",
		};

		// Set the context for "this" for the following functions
		this.addTag = this.addTag.bind(this);
		this.editTag = this.editTag.bind(this);
		this.handleSelectedTag = this.handleSelectedTag.bind(this);
		this.handleTagKeys = this. handleTagKeys.bind(this);
		this.changeSort = this.changeSort.bind(this);
	}

	// Handles changing which tag is the current tag,
	// which tag is currently selected
	handleSelectedTag(tagID) {
		this.setState({
			selectedTag: tagID,
		})
	}

	handleTagKeys(tagKeys) {
		this.setState({
			tagKeys: tagKeys,
		})
	}

	// Triggers before editing a tag
	editTag(tagID, tag) {
		this.setState({
			tagID: tagID,
			tag: tag,
			edit: true,
			showTagInfo: true,
		});
	}

	// Triggers before adding a tag
	addTag() {
		this.setState({
			tagID: null,
			tag: {name: "", description: "", type: "Location", colour: "#415b39"},
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

	render() {

		let tagsPage = this;

		// Render tag items
		let tagItems;

		if(!this.props.campaign.tags) {
			tagItems = <div></div>; //Render nothing if there are no tags
		} else {
			
			let sortedKeys = [...this.state.tagKeys];

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
					<TagFilter
						campaign = {this.props.campaign}
						handleTagKeys = {this.handleTagKeys}
						tagSort = {this.state.tagSort}
					/>
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
						tag = {this.state.tag}
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