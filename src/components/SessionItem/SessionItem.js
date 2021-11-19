import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';
import SessionInfo from '../SessionInfo/SessionInfo';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This class holds the session item component, found in the list to the
	left on the session page. This component holds the layout as well as 
	the function for deleting.
*/
class SessionItem extends Component {

	constructor(props) {
		super(props);

		this.state = {
			showSessionInfo: false,
		}

		// Set the context for "this" for the following function
		this.deleteSession = this.deleteSession.bind(this);
	}

	// Triggers when deleting a session
	deleteSession(attempted) {
    
		// Delete recaps from tags locally and from recaps collection on Firestore
		let tags = this.props.tags;
		let recaps = this.props.sessions[this.props.sessionID].recaps;
		let campaign = this.props.campaign;

		if(!attempted) {
			for(let recap in recaps) {

				// Delete from tags locally
				recaps[recap].tags.forEach(tag => {
					delete tags[tag].recaps[recap];
				});
				
				// Delete on Firestore
				this.props.campaignRef.collection("recaps").doc(recap).delete()
				.then(() => {
					console.log("Recap successfully deleted!");
				}).catch((error) => {
					console.log("Error deleting recap:", error);
				});
			}
			this.props.handleTags(tags);
		}

		// Delete session from the session order list
		let sessionOrder = [...campaign.sessionOrder];
		let sessionIndex = sessionOrder.indexOf(this.props.sessionID);
		if (sessionIndex !== -1) sessionOrder.splice(sessionIndex, 1);

		// Delete session info on Firestore
		this.props.campaignRef.update({
			operation: "session-delete",
			["sessions." + this.props.sessionID]: firebase.firestore.FieldValue.delete(),
			sessionOrder: sessionOrder,
			selectedSession: this.props.sessionID,
		}).then(() => {
			console.log("Session successfully deleted!");

			// Delete session recaps locally
			let sessions = this.props.sessions;
			delete sessions[this.props.sessionID];
			this.props.handleSessions(sessions);		

			// Delete session info locally
			delete campaign.sessions[this.props.sessionID];
			campaign.sessionOrder = sessionOrder;
			this.props.handleCampaign(campaign);

			// Update selected session to the last session chronologically
			let latestSession = sessionOrder[0] ? sessionOrder[0] : "";
			this.props.handleSelectedSession(latestSession);

			this.props.campaignRef.update({
				operation: "selected-session-update",
				selectedSession: latestSession,
			}).then(() => {
				console.log("Selected session successfully updated");
			}).catch((error) => {
				console.log("Error updating selected session:", error);
			});
		}).catch((error) => {
			console.log("Error deleting session:", error);
			if(attempted) {
				this.props.handleError(error, "Could not delete session")
			} else {
				console.log("Reading and reattempting");
				this.props.loadCampaign(
					() => {this.deleteSession(true)}
				);
			}
		});
	}

	render() {

		// Text for pop-up when deleting
		const deleteText = {
			title: "Delete Session",
			text: "Are you sure you want to delete this session and all recaps written for it?"
		}

		// Create number for session order
		let number = "#" + (this.props.campaign.sessionOrder.length - 
			this.props.campaign.sessionOrder.indexOf(this.props.sessionID)) + " ";

		// Create date
		let session = this.props.campaign.sessions[this.props.sessionID]
		let date = new Date(session.date.seconds * 1000);
		
		return (
			<>
				<Card 
					className="session-item item transition-border" 
					border={this.props.isSelectedSession ? "info" : ""} 
					onClick = {this.props.click}
				>
					<Card.Body >
						<Card.Title>
							<Row className="remove-margin">
								<Col xs={10} sm={9} className="remove-padding session-item-title">
									{session.description}
								</Col>
								<Col xs={2} sm={3} className="right-align item-menu remove-padding">
									<ItemMenu
										edit = {() => this.setState({ showSessionInfo: true})}
										delete = {() => this.deleteSession(false)}
										deleteText = {deleteText}
									/> 
								</Col>
							</Row>
							
						</Card.Title>
						<Card.Text className="regular-text text-grey-italic">
							{number + date.toDateString()}
						</Card.Text>
					</Card.Body>
				</Card>
				<SessionInfo 
					show = {this.state.showSessionInfo}
					onHide = {() => this.setState({ showSessionInfo: false })}
					sessions = {this.props.sessions}
					campaign = {this.props.campaign}
					handleSessions = {this.props.handleSessions}
					handleCampaign = {this.props.handleCampaign}
					handleError = {this.props.handleError}
					campaignRef = {this.props.campaignRef}
					edit = {true}
					session = {session}
					sessionID = {this.props.sessionID}
					loadCampaign = {this.props.loadCampaign}
				/>
			</>
		);
	}
}

export default withFirebase(SessionItem)