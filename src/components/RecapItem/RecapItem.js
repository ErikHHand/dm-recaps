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

	// This function is called when editing recap data
	writeRecap(recapItem, oldRecap) {

		// Remove edit text area if it was open
		this.setState({
			edit: false,
		});

		// Add to Firestore Recaps collection
		this.props.campaignRef.collection("recaps").doc(this.props.recapID).set(recapItem)
		.then(() => {
			console.log("Recap successfully updated!");

			// Add locally to sessions
			let sessions = this.props.sessions;
			sessions[recapItem.session].recaps[this.props.recapID] = recapItem;
			this.props.handleSessions(sessions);

			// Add or delete locally based on which tags are attached to this recap item
			let tags = this.props.tags;
			
			for (let tag in tags) {

				// If tag has been added, add locally to tags object
				if(recapItem.tags.includes(tag)){
					tags[tag].recaps[this.props.recapID] = recapItem;
				}

				// If tag has been removed, delete locally from tags object
				else if(!recapItem.tags.includes(tag) && oldRecap.tags.includes(tag)) {
					delete tags[tag].recaps[this.props.recapID];
				}	
			}
			this.props.handleTags(tags);
		}).catch((error) => {
			console.log("Error updating recap:", error);
			this.props.handleError(error, "Could not save changes to recap");
			if(this.props.selectedTag) {
				let tags = this.props.tags;
				tags[this.props.selectedTag].recaps[this.props.recapID] = oldRecap;
				this.props.handleTags(tags)
			} else {
				let sessions = this.props.sessions;
				sessions[recapItem.session].recaps[this.props.recapID] = oldRecap;
				this.props.handleSessions(sessions);
			}
		});
	}

	// Triggers when a user clicks "edit" in the item menu on recap items
	// This will replace the static text with a editable text field
	editRecap() {
		this.setState({
			edit: true,
		});
	}
	
	// Function for deleting a recap item
	deleteRecap(attempted) {

		let session = this.props.recapItem.session;

		// Delete recap in recap order list
		let campaign = this.props.campaign;
		let recapOrder = [...campaign.sessions[session].recapOrder];
		
		let indexRecapOrder = recapOrder.indexOf(this.props.recapID);
		if (indexRecapOrder !== -1) recapOrder.splice(indexRecapOrder, 1);

		// Delete from Firestore Recap order
		this.props.campaignRef.update({
			operation: "recap-delete",
			recapID: this.props.recapID,
			recapOrder: recapOrder,
			['sessions.' + session + '.recapOrder']: recapOrder,
			selectedSession: this.props.recapItem.session,
		}).then(() => {
			console.log("Recap successfully deleted from recap order list");

			// Delete recap on Firestore Recaps collection
			this.props.campaignRef.collection("recaps").doc(this.props.recapID).delete()
			.then(() => {
				console.log("Recap successfully deleted!");

				// update locally
				campaign.sessions[session].recapOrder = recapOrder;
				this.props.handleCampaign(campaign);

				// Delete recap locally in session
				let sessions = this.props.sessions;
				delete sessions[session].recaps[this.props.recapID];
				this.props.handleSessions(sessions);

				// Delete recaps from tags locally
				let tags = this.props.tags;

				this.props.recapItem.tags.forEach(tag => {
					delete tags[tag].recaps[this.props.recapID];
				});

				this.props.handleTags(tags);
			}).catch((error) => {
				console.log("Error deleting recap, restoring recapOrder list:", error);
				this.props.handleError(error, "Could not delete recap");
				this.props.campaignRef.update({
					operation: "recap-add",
					recapID: this.props.recapID,
					recapOrder: campaign.sessions[session].recapOrder,
					['sessions.' + session + '.recapOrder']: campaign.sessions[session].recapOrder,
					selectedSession: this.props.recapItem.session,
				}).then(() => {
					console.log("Restored recapOrder list");
				}).catch((error) => {
					console.log("ERROR RESTORING RECAP ITEM LIST:", error);
				});
			});
		}).catch((error) => {
			console.log("Error deleting recap from recap order list:", error);
			if(attempted) {
				this.props.handleError(error, "Could not delete recap");
			} else {
				console.log("Reading and reattempting");
				this.props.loadCampaign(
					() => {this.deleteRecap(true)}
				);
			}
		});
	}

	// Moves the recap item up or down one place in the recap order array
	changeRecapOrder(attempted, direction) {
		let session = this.props.recapItem.session;
		let recapOrder = [...this.props.campaign.sessions[session].recapOrder];
		let index = recapOrder.indexOf(this.props.recapID);

		// Move the recap item in the desired direction
		recapOrder.splice(index, 1);
		if(direction === "up") {
			recapOrder.splice(index - 1, 0, this.props.recapID)
		} else if (direction === "down") {
			recapOrder.splice(index + 1, 0, this.props.recapID)
		}

		// Check that it is possible to move item in that direction
		if((direction === "up" && index === 0) ||
			(direction === "down" && index === recapOrder.length - 1)) {
			return;
		}
		
		// Write changes on Firestore
		this.props.campaignRef.update({
			operation: "recap-move",
			recapID: this.props.recapID,
			recapOrder: recapOrder,
			['sessions.' + session + '.recapOrder']: recapOrder,
			selectedSession: session,
		})
		.then(() => {
			console.log("Recap order successfully changed");

			// Write changes locally
			let campaign = this.props.campaign;
			campaign.sessions[session].recapOrder = recapOrder;
			this.props.handleCampaign(campaign);
		}).catch((error) => {
			console.log("Error changing recap order:", error);
			if(attempted) {
				this.props.handleError(error, "Could not move recap");
			} else {
				console.log("Reading and reattempting");
				this.props.loadCampaign(
					() => {this.changeRecapOrder(true, direction)}
				);
			}
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
					<Row className="remove-margin">
						<Col lg="1" sm="2" xs="2" className="remove-padding">
							{
								(this.state.showIcons &&
									this.props.campaign.activeTab === "sessions" )?
								<div>
									<FontAwesomeIcon 
										icon={faArrowUp} 
										onClick={() => this.changeRecapOrder(false, "up")}
										className={"arrow icon"}
									/>
									<FontAwesomeIcon 
										icon={faArrowDown} 
										onClick={() => this.changeRecapOrder(false, "down")}
										className={"arrow icon"}
									/>
								</div> :	
								<></>
							}
						</Col>
						<Col lg="10" sm="8" xs="8" className="remove-padding">
							<div
								onClick={() => this.props.handleSelectedSession(this.props.recapItem.session)}
								className="session-info-text recap-session-info-text"
							>
								{number + date.toDateString()}
								&emsp; 
								{this.props.campaign.sessions[this.props.recapItem.session].description}
							</div>
						</Col>
						<Col lg="1" sm="2" xs="2" className="right-align remove-padding item-menu">
							{
								this.state.showIcons ?
								<ItemMenu
									edit = {this.editRecap}
									delete = {() => this.deleteRecap(false)}
									deleteText = {deleteText}
								/> :
								<></>
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
					<Row className="remove-margin">
						<Col className="remove-padding">
							<RecapTagSelector
								recapItem = {this.props.recapItem}
								writeRecap = {this.writeRecap}
								tags = {this.props.tags}
								campaign = {this.props.campaign}
								handleTags = {this.props.handleTags}
								handleCampaign = {this.props.handleCampaign}
								handleSelectedTag = {this.props.handleSelectedTag}
								handleError = {this.props.handleError}
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