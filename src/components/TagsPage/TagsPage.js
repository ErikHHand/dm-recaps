import React, { Component } from 'react';

import RecapItem from '../RecapItem/RecapItem';
import TagItem from '../TagItem/TagItem';
import TagInfo from '../TagInfo/TagInfo';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This component holds the tags tab of the App.
*/
class TagsPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			showAddWindow: false,
			currentTag: null,
		};

		// Set the context for "this" for the following function
		this.handleCurrentTag = this.handleCurrentTag.bind(this);
	}

	// Handles changing which tag is the current tag,
	// which tag is currently selected
	handleCurrentTag(tagID) {
		this.setState({
			currentTag: tagID,
		})
	}

	render() {

		let tagsPage = this;

		// Render tag items
		let tagItems;

		if(!this.props.campaign.tags) {
			tagItems = <div></div>; //Render nothing if there are no tags
		} else {
			// Sort keys in date order, meaning tags created more recently will appear higher up
			let sortedKeys = Object.keys(this.props.campaign.tags).sort((a, b) => {				
				return this.props.campaign.tags[b].created.toDate() - this.props.campaign.tags[a].created.toDate();
			});
			
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
					handleCurrentTag = {this.handleCurrentTag}
					handleClick = {() => tagsPage.setState({currentTag: tag})}
					campaignID = {this.props.campaignID} // TODO Can probably be deleted when TagInfo is cleaned
					campaignRef = {this.props.campaignRef}
				/>
			);
		}

		// Render recap items
		let recapItems;

		if(!this.state.currentTag) {
			recapItems = <div></div>; // No current tag
		} else if(!this.props.tags[this.state.currentTag]) {
			recapItems = <div></div>; // // Current tag doesn't exist?
		} else {

			let recapList = this.props.tags[this.state.currentTag].recaps;
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

			recapItems = sortedKeys.map((recapID)=>
				<RecapItem 
					key = {recapID}
					recapID = {recapID}
					recapItem = {recapList[recapID]}
					tags = {this.props.tags}
					sessions = {this.props.sessions}
					handleSessions = {this.props.handleSessions}
					handleTags = {this.props.handleTags}
					handleCampaign = {this.props.handleCampaign}
					id = {this.props.campaignID}
					campaign = {this.props.campaign}
				/>
			);
		}

		return (
			<Row>
				<Col md={3} className="overflow-scroll">
					{tagItems}
					<div className="center">
						<Button variant="success" onClick={() => this.setState({ showAddWindow: true })}>New Tag</Button>
					</div>
					<TagInfo 
						show = {this.state.showAddWindow}
						onHide = {() => this.setState({ showAddWindow: false })}
						tags = {this.props.tags}
						campaign = {this.props.campaign}
						handleTags = {this.props.handleTags}
						handleCampaign = {this.props.handleCampaign}
						id = {this.props.campaignID}
					/>
				</Col>
				<Col md={9} className="overflow-scroll">
					{recapItems}
				</Col>
			</Row>
		)
	}
}

export default withFirebase(TagsPage)