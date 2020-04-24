import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';
import RecapEditText from '../RecapEditText/RecapEditText';
import RecapTagSelector from '../RecapTagSelector/RecapTagSelector';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This component represents a recap item, the whole card with recap text
	and attached tags.
*/
class RecapItem extends Component {

	constructor(props) {
		super(props);

		this.state = {
			edit: false,
		}

		// Set the context for "this" for the following functions
		this.deleteRecap = this.deleteRecap.bind(this);
		this.editRecap = this.editRecap.bind(this);
		this.writeRecap = this.writeRecap.bind(this);
	}

	// Write recap
	// This function is called when adding a new recap
	// or editing recap data
	writeRecap(recapItem, previousTags) {

		// Remove edit text area
		this.setState({
			edit: false,
		});

		let id = this.props.recapID;
		
		// Add locally to sessions
		let sessions = this.props.sessions;
		sessions[recapItem.session].recaps[this.props.recapID] = recapItem
		this.props.handleSessions(sessions);

		// Add to Firestore Sessions
		this.props.campaignRef.collection("sessions").doc(recapItem.session).update({
			['recaps.' + id]: recapItem,
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});

		// Add or delete locally and on Firestore
		let tagsCollection = this.props.tags;
		
		for (let tag in tagsCollection) {

			// If tag has been added
			if(recapItem.tags.includes(tag)){
				
				// Add locally to tags
				tagsCollection[tag].recaps[id] = recapItem;
				this.props.handleTags(tagsCollection);
				
				// Add to Firestore Tags
				this.props.campaignRef.collection("tags").doc(tag).update({
					['recaps.' + id]: recapItem,
				})
				.then(function() {
					console.log("Document successfully updated!");
				}).catch(function(error) {
					console.log("Error getting document:", error);
				});
			}

			// If tag has been removed
			else if(!recapItem.tags.includes(tag) && previousTags.includes(tag)) {

				// Delete locally and from Firestore
				this.deleteFromTags(tag, tagsCollection)
			}	
		}
		this.props.handleTags(tagsCollection);
	}

	// Delete recap item from tags collection, both locally and on Firestore
	deleteFromTags(tag, tags) {

		// Delete locally from tags
		delete tags[tag].recaps[this.props.recapID];

		// Delete from Firestore Tags
		this.props.campaignRef.collection("tags").doc(tag).update({
			['recaps.' + this.props.recapID]: firebase.firestore.FieldValue.delete(),
		})
		.then(function() {
			console.log("Document successfully deleted!");
		}).catch(function(error) {
			console.log("Error deleting field:", error);
		});
	}

	editRecap() {
		this.setState({
			edit: true,
		});
	}
	  
	deleteRecap() {

		let session = this.props.recapItem.session;

		// Delete recap in Recap order
		let campaign = this.props.campaign;
		
		let index = campaign.sessions[session].recapOrder.indexOf(this.props.recapID);
		if (index !== -1) campaign.sessions[session].recapOrder.splice(index, 1);

		this.props.handleCampaign(campaign);

		// Delete from Firestore Recap order
		this.props.campaignRef.update({
			['sessions.' + session + '.recapOrder']: campaign.sessions[session].recapOrder,
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});

		// Delete recap locally in session
		let sessions = this.props.sessions;
		delete sessions[session].recaps[this.props.recapID];
		this.props.handleSessions(sessions);

		// Delete recap on Firestore sessions
		this.props.campaignRef.collection("sessions").doc(session).update({
			['recaps.' + this.props.recapID]: firebase.firestore.FieldValue.delete(),
		})
		.then(function() {
			console.log("Document successfully deleted!");
		}).catch(function(error) {
			console.log("Error deleting document:", error);
		});


		// Delete recaps from tags locally and on firestore
		let tags = this.props.tags;

		this.props.recapItem.tags.forEach(tag => {
			this.deleteFromTags(tag, tags)
		});

		this.props.handleTags(tags);
	}

	render() {

		// Text for recap item deletion
		const deleteText = {
			title: "Delete Recap",
			text: "Are you sure you want to delete this recap?"
		}

		let date = new Date(this.props.campaign.sessions[this.props.recapItem.session].date.seconds * 1000);

		// Create number for session order
		let number = "#" + (this.props.campaign.sessionOrder.length - 
			this.props.campaign.sessionOrder.indexOf(this.props.recapItem.session)) + " ";
		
		return (
			<Card onClick = {this.props.click}>
				<Card.Body className="recap-body">
					<Row>
						<Col></Col>
						<Col xs="auto" className="session-info-text">
							{number + date.toDateString()}
							&emsp;
							{this.props.campaign.sessions[this.props.recapItem.session].description}
						</Col>
						<Col xs="1">
							<ItemMenu
								edit = {this.editRecap}
								delete = {this.deleteRecap}
								deleteText = {deleteText}
							/>
						</Col>
					</Row>
					<Row>
						<Col>
							{this.state.edit ? 
								<RecapEditText
									recapItem = {this.props.recapItem}
									writeRecap = {this.writeRecap}
								/> : 
								<p className="recap-text">{this.props.recapItem.text}</p>
							}
						</Col>
					</Row>
					<Row>
						<Col>
							<RecapTagSelector
								campaign = {this.props.campaign}
								recapItem = {this.props.recapItem}
								writeRecap = {this.writeRecap}
							/>
						</Col>
					</Row>
				</Card.Body>
			</Card>
		)
	}
}

export default withFirebase(RecapItem)