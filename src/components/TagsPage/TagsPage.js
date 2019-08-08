import React, { Component } from 'react';

import RecapItem from '../RecapItem/RecapItem';
import TagItem from '../TagItem/TagItem';
import TagInfo from '../TagInfo/TagInfo';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
//import Form from 'react-bootstrap/Form'
import Badge from 'react-bootstrap/Badge'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Ta inte bort

class TagsPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			showAddWindow: false,
			currentTag: null,
		};

		this.handleCurrentTag = this.handleCurrentTag.bind(this);
	}

	handleCurrentTag(tagID) {
		this.setState({
			currentTag: tagID,
		})
	}

	render() {

		let recapItems;

		if(!this.state.currentTag) {
			recapItems = <div></div>;
		} else if(!this.props.tags[this.state.currentTag]) {
			recapItems = <div></div>;	 
		} else {
			let recapList = this.props.tags[this.state.currentTag].recaps;

			// Order recap items chronologically

			let length = this.props.campaign.sessionOrder.length;
			let recapKeys = {};

			for(let recapItem in recapList) {
				let session = this.props.campaign.sessions[recapList[recapItem].session];
				let sessionIndex = this.props.campaign.sessionOrder.indexOf(recapList[recapItem].session);
				recapKeys[recapItem] = (length - sessionIndex) * 100000 + session.recapOrder.indexOf(Number(recapItem));
			}			

			// Sort keys
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

		let tagItems;

		let tagsPage = this;

		if(!this.props.campaign.tags) {
			tagItems = <div></div>;
		} else {
			// Sort keys in date order
			let sortedKeys = Object.keys(this.props.campaign.tags).sort((a, b) => {				
				return this.props.campaign.tags[b].created.toDate() - this.props.campaign.tags[a].created.toDate();
			});
			
			tagItems = sortedKeys.map((tag)=>
				<TagItem 
					key = {tag}
					tagID = {tag}
					tag = {this.props.campaign.tags[tag]}
					sessions = {this.props.sessions}
					tags = {this.props.tags}
					campaign = {this.props.campaign}
					handleSessions = {this.props.handleSessions}
					handleTags = {this.props.handleTags}
					handleCampaign = {this.props.handleCampaign}
					handleCurrentTag = {this.handleCurrentTag}
					handleClick = {() => tagsPage.setState({currentTag: tag})}
					id = {this.props.campaignID}
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