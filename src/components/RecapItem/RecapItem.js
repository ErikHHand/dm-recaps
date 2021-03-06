import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';
import RecapEditText from '../RecapEditText/RecapEditText';
import RecapTagSelector from '../RecapTagSelector/RecapTagSelector';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';

import { withFirebase } from '../Firebase/Firebase';

/*
	This component holds a recap item, which is a card with recap text
	and attached tags.
*/
class RecapItem extends Component {

	constructor(props) {
		super(props);

		this.state = {
			edit: false,
			showIcons: false,
		}

		// Set the context for "this" for the following functions
		this.deleteRecap = this.deleteRecap.bind(this);
		this.editRecap = this.editRecap.bind(this);
		this.writeRecap = this.writeRecap.bind(this);
	}

	// This function is called when adding a new recap
	// or editing recap data
	writeRecap(recapItem, previousTags) {

		// Remove edit text area if it was open
		this.setState({
			edit: false,
		});
		
		// Add locally to sessions
		let sessions = this.props.sessions;
		sessions[recapItem.session].recaps[this.props.recapID] = recapItem
		this.props.handleSessions(sessions);

		// Add to Firestore Recaps collection
		this.props.campaignRef.collection("recaps").doc(this.props.recapID).set(recapItem)
		.then(() => {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});

		// Add or delete locally based on
		// which tags are attached to this recap item
		let tags = this.props.tags;
		
		for (let tag in tags) {

			// If tag has been added
			if(recapItem.tags.includes(tag)){
				tags[tag].recaps[this.props.recapID] = recapItem; // Add locally to tags
			}

			// If tag has been removed
			else if(!recapItem.tags.includes(tag) && previousTags.includes(tag)) {
				delete tags[tag].recaps[this.props.recapID]; // Delete locally 
			}	
		}
		this.props.handleTags(tags);
	}

	// Triggers when a user clicks "edit" in the item menu on recap items
	// This will replace the static text with a editable text field
	editRecap() {
		this.setState({
			edit: true,
		});
	}
	
	// Function for deleting a recap item
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
		.then(() => {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});

		// Delete recap locally in session
		let sessions = this.props.sessions;
		delete sessions[session].recaps[this.props.recapID];
		this.props.handleSessions(sessions);

		// Delete recap on Firestore Recaps collection
		this.props.campaignRef.collection("recaps").doc(this.props.recapID).delete()
		.then(() => {
			console.log("Document successfully deleted!");
		}).catch(function(error) {
			console.log("Error deleting document:", error);
		});


		// Delete recaps from tags locally and on firestore
		let tags = this.props.tags;

		this.props.recapItem.tags.forEach(tag => {
			delete tags[tag].recaps[this.props.recapID];
		});

		this.props.handleTags(tags);
	}

	// Moves the recap item up or down one place in the recap order array
	changeRecapOrder(direction) {
		let session = this.props.recapItem.session;
		let recapOrder = [...this.props.campaign.sessions[session].recapOrder];
		let index = recapOrder.indexOf(this.props.recapID);

		// Check that it is possible to move item in that direction
		if((direction === "up" && index === 0) ||
			(direction === "down" && index === recapOrder.length - 1)) {
			return;
		}
		
		// Move the recap item in the desired direction
		recapOrder.splice(index, 1);
		if(direction === "up") {
			recapOrder.splice(index - 1, 0, this.props.recapID)
		} else if (direction === "down") {
			recapOrder.splice(index + 1, 0, this.props.recapID)
		}

		// Write changes locally
		let campaign = this.props.campaign;
		campaign.sessions[session].recapOrder = recapOrder;
		this.props.handleCampaign(campaign);
		
		// Write changes on Firestore
		this.props.campaignRef.update({
			['sessions.' + session + '.recapOrder']: recapOrder,
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});
	}

	render() {

		// Text for recap item deletion
		const deleteText = {
			title: "Delete Recap",
			text: "Are you sure you want to delete this recap?"
		}

		// Date for the session of this recap item
		let date = new Date(this.props.campaign.sessions[this.props.recapItem.session].date.seconds * 1000);

		// Create number for session order
		let number = "#" + (this.props.campaign.sessionOrder.length - 
			this.props.campaign.sessionOrder.indexOf(this.props.recapItem.session)) + " ";
		
		return (
			<Card>
				<Card.Body 
					className="recap-body"
					onMouseEnter={() => this.setState({showIcons: true})} 
					onMouseLeave={() => this.setState({showIcons: false})}
						>
					<Row noGutters={true}>
						<Col lg="1" md="2">
							{
								(this.state.showIcons &&
									this.props.campaign.activeTab === "sessions" )?
								<div>
									<FontAwesomeIcon 
										icon={faArrowUp} 
										onClick={() => this.changeRecapOrder("up")}
										className={"arrow icon"}
									/>
									<FontAwesomeIcon 
										icon={faArrowDown} 
										onClick={() => this.changeRecapOrder("down")}
										className={"arrow icon"}
									/>
								</div> :	
								<div></div>
							}
							
						</Col>
						<Col lg="10" md="8">
							<div
								onClick={() => this.props.handleSelectedSession(this.props.recapItem.session)}
								className="session-info-text recap-session-info-text"
							>
								{number + date.toDateString()}
								&emsp; 
								{this.props.campaign.sessions[this.props.recapItem.session].description}
							</div>
						</Col>
						<Col lg="1" md="2" className="right-align">
							{
								this.state.showIcons ?
								<ItemMenu
									edit = {this.editRecap}
									delete = {this.deleteRecap}
									deleteText = {deleteText}
								/> :
								<div></div>
							}
						</Col>
					</Row>
					<Row>
						<Col>
							{this.state.edit ? 
								<RecapEditText
									recapItem = {this.props.recapItem}
									writeRecap = {this.writeRecap}
								/> : 
								<p className="recap-text with-line-breaks regular-text">{this.props.recapItem.text}</p>
							}
						</Col>
					</Row>
					<Row>
						<Col>
							<RecapTagSelector
								recapItem = {this.props.recapItem}
								writeRecap = {this.writeRecap}
								tags = {this.props.tags}
								campaign = {this.props.campaign}
								handleTags = {this.props.handleTags}
								handleCampaign = {this.props.handleCampaign}
								handleSelectedTag = {this.props.handleSelectedTag}
								campaignRef = {this.props.campaignRef}
							/>
						</Col>
					</Row>
				</Card.Body>
			</Card>
		)
	}
}

export default withFirebase(RecapItem)