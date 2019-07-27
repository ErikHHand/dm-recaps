import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';
import SessionInfo from '../SessionInfo/SessionInfo';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

class SessionItem extends Component {

	constructor(props) {
		super(props);

		this.deleteSession = this.deleteSession.bind(this);
		this.editSession = this.editSession.bind(this);

		this.state = {
			showEditWindow: false,
		}
	}

	editSession() {
		this.setState({
			showEditWindow: true,
		});
	}

	deleteSession() {

		// Set current session to null
		this.props.handleCurrentSession(null);

		// Delete recaps from tags locally and on firestore

		let tags = this.props.tags;
		for(let recap in this.props.sessions[this.props.sessionID].recaps) {
			this.props.sessions[this.props.sessionID].recaps[recap].tags.forEach(tag => {
				
				// Delete locally
				delete tags[tag].recaps[recap];

				// Delete on firestore

				this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
				.collection("campaigns").doc(this.props.id).collection("tags")
				.doc(tag).update({
					["recaps." + recap]: firebase.firestore.FieldValue.delete(),
				})
				.then(function() {
					console.log("Document successfully deleted!");
				}).catch(function(error) {
					console.log("Error deleting document:", error);
				});
			});
		}

		this.props.handleTags(tags);


		// Delete session recaps locally

		let sessions = this.props.sessions;
		delete sessions[this.props.sessionID];
		this.props.handleSessions(sessions);

		// Delete session recaps on Firestore

		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).collection("sessions")
		.doc(this.props.sessionID).delete()
		.then(function() {
			console.log("Document successfully deleted!");
		}).catch(function(error) {
			console.log("Error deleting document:", error);
		});


		// Delete session info locally

		let campaign = this.props.campaign;
		delete campaign.sessions[this.props.sessionID];

		let sessionIndex = campaign.sessionOrder.indexOf(this.props.sessionID);
		if (sessionIndex !== -1) campaign.sessionOrder.splice(sessionIndex, 1);

		this.props.handleCampaign(campaign);

		// Delete session info on Firestore

		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).update({
			["sessions." + this.props.sessionID]: firebase.firestore.FieldValue.delete(),
			sessionOrder: campaign.sessionOrder,
		})
		.then(function() {
			console.log("Document successfully deleted!");
		}).catch(function(error) {
			console.log("Error deleting document:", error);
		});
	}

	render() {

		const deleteText = {
			title: "Delete Session",
			text: "Are you sure you want to delete this session and all recaps written for it?"
		}

		let date = this.props.session.date;
		date = new Date(date.seconds * 1000);		
		
		return (
			<>
				<Card border="primary" style={{ width: "17rem"}} onClick = {this.props.click}>
					<Card.Body>
						<Card.Title>
							<Row>
								<Col md="9">
									{date.toDateString()} 
								</Col>
								<Col md="3" className="center">
									<ItemMenu
										edit = {this.editSession}
										delete = {this.deleteSession}
										deleteText = {deleteText}
									/>
								</Col>
							</Row>
						</Card.Title>
						<Card.Text>{this.props.session.description}</Card.Text>
					</Card.Body>
				</Card>
				<SessionInfo
					show = {this.state.showEditWindow}
					onHide = {() => this.setState({ showEditWindow: false })}
					sessions = {this.props.sessions}
					handleSessions = {this.props.handleSessions}
					campaign = {this.props.campaign}
					handleCampaign = {this.props.handleCampaign}
					id = {this.props.id}
					edit = {true}
					description = {this.props.session.description}
					date = {date}
					sessionID = {this.props.sessionID}
				/>
			</>
		);
	}
}

export default withFirebase(SessionItem)