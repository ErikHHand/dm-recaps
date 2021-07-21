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
			showIcons: false,
		}

		// Set the context for "this" for the following function
		this.deleteSession = this.deleteSession.bind(this);
	}

	// Triggers when deleting a session
	deleteSession() {
		console.log("hello from deleteSession()!")
		// Delete recaps from tags locally and on Firestore
		let tags = this.props.tags;
		let recaps = this.props.sessions[this.props.sessionID].recaps
		let campaign = this.props.campaign;

		for(let recap in recaps) {

			console.log(campaign.recaps)

			// Delete in recaps array in campaign
			let index = campaign.recaps.indexOf(recap);
			if (index > -1) {
				campaign.recaps.splice(index, 1);
			}

			console.log(campaign.recaps)

			// Delete from tags
			recaps[recap].tags.forEach(tag => {
				delete tags[tag].recaps[recap];
			});

			// Delete on Firestore
			this.props.campaignRef.collection("recaps").doc(recap).delete()
			.then(() => {
				console.log("Document successfully deleted!");
			}).catch((error) => {
				console.log("Error deleting document:", error);
			});
		}
		this.props.handleTags(tags);

		// Delete session recaps locally
		let sessions = this.props.sessions;
		delete sessions[this.props.sessionID];
		this.props.handleSessions(sessions);		

		// Delete session info locally
		delete campaign.sessions[this.props.sessionID];

		// Delete session from the session order list
		let sessionIndex = campaign.sessionOrder.indexOf(this.props.sessionID);
		if (sessionIndex !== -1) campaign.sessionOrder.splice(sessionIndex, 1);
		this.props.handleCampaign(campaign);

		// Delete session info on Firestore
		this.props.campaignRef.update({
			["sessions." + this.props.sessionID]: firebase.firestore.FieldValue.delete(),
			sessionOrder: campaign.sessionOrder,
			selectedSession: this.props.sessionID,
			recaps: campaign.recaps
		})
		.then(() => {
			console.log("Document successfully deleted!");

			// Update selected session
			let latestSession = campaign.sessionOrder[campaign.sessionOrder.length - 1] ? 
				campaign.sessionOrder[campaign.sessionOrder.length - 1] : "";
			this.props.handleSelectedSession(latestSession);

			this.props.campaignRef.update({
				selectedSession: latestSession,
			})
			.then(() => {
				console.log("Document successfully deleted!");
			}).catch((error) => {
				console.log("Error deleting document:", error);
			});
		}).catch((error) => {
			console.log("Error deleting document:", error);
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
					className="session-item item" 
					border={this.props.isSelectedSession ? "info" : ""} 
					onClick = {this.props.click}
					onMouseEnter={() => this.setState({showIcons: true})} 
					onMouseLeave={() => this.setState({showIcons: false})}
				>
					<Card.Body >
						<Card.Title>
							<Row>
								<Col md={9} className="item-title">
									{session.description}
								</Col>
								<Col md={3} className="center item-menu-pos">
									{
										this.state.showIcons ?
										<ItemMenu
											edit = {() => this.setState({ showSessionInfo: true})}
											delete = {this.deleteSession}
											deleteText = {deleteText}
										/> :
										<div></div>
									}
								</Col>
							</Row>
							
						</Card.Title>
						<Card.Text className="session-info-text">
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
					campaignRef = {this.props.campaignRef}
					edit = {true}
					session = {session}
					sessionID = {this.props.sessionID}
				/>
			</>
		);
	}
}

export default withFirebase(SessionItem)