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
		let recapID = 1;

		if(!this.state.currentTag) {
			recapItems = <div></div>;	 
		} else {

			let sessionsRef = this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
			.collection("campaigns").doc(this.props.id).collection("sessions");
			
			sessionsRef.where("recaps.0.session", "==", "7YyvD6keHo3efXkQjEcC").get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					// doc.data() is never undefined for query doc snapshots
					console.log(doc.id, " => ", doc.data());
				});
			})
			.catch(function(error) {
				console.log("Error getting documents: ", error);
			});
			

			//console.log(recapList);
			/*
			recapItems = Array.from(Object.keys(recapList)).map((recapID)=>
				<RecapItem 
					key = {recapID}
					recapItem = {recapList[recapID]}
					tags = {this.props.campaign.tags}
					sessions = {this.props.sessions}
					handleSessions = {this.props.handleSessions}
					recapID = {recapID}
					id = {this.props.id}
				/>
			);*/
		}

		let tagItems;

		let tagsPage = this;

		if(!this.props.campaign.tags) {
			tagItems = <div></div>;
		} else {
			
			tagItems = Array.from(Object.keys(this.props.campaign.tags)).map((tag)=>
				<TagItem 
					key = {tag}
					tag = {this.props.campaign.tags[tag]}
					handleClick = {() => tagsPage.setState({currentTag: tag})}
				/>
			);
		}

		console.log(this.state.currentTag);

		return (
			<Row>
				<Col md={3}>
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
				<Col md={9}>
					{recapItems}
				</Col>
			</Row>
		)
	}
}

export default withFirebase(TagsPage)