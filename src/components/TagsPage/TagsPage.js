import React, { Component } from 'react';

import RecapItem from '../RecapItem/RecapItem';
import TagItem from '../TagItem/TagItem';
import NewTag from '../NewTag/NewTag';

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
			id: this.props.id,
			currentTag: null,
		};
	}

	render() {

		let recapItems;

		if(!this.state.currentTag) {
			recapItems = <div></div>;	 
		} else {
			let recapList = this.props.tags[this.state.currentTag].recaps;
			recapItems = Array.from(Object.keys(recapList)).map((recapID)=>
				<RecapItem 
					key = {recapID}
					recapID = {recapID}
					recapItem = {recapList[recapID]}
					tags = {this.props.tags}
					sessions = {this.props.sessions}
					handleSessions = {this.props.handleSessions}
					handleTags = {this.props.handleTags}
					id = {this.props.id}
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
					tag = {this.props.campaign.tags[tag]}
					handleClick = {() => tagsPage.setState({currentTag: tag})}
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
					<NewTag 
						show = {this.state.showAddWindow}
						onHide = {() => this.setState({ showAddWindow: false })}
						tags = {this.props.tags}
						campaign = {this.props.campaign}
						handleTags = {this.props.handleTags}
						handleCampaign = {this.props.handleCampaign}
						id = {this.state.id}
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