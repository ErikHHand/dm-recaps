import React, { Component } from 'react';

import NewSession from '../NewSession/NewSession';
import SessionItem from '../SessionItem/SessionItem';
import RecapItem from '../RecapItem/RecapItem';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

String.prototype.hashCode = function() {
	var hash = 0, i, chr;
	if (this.length === 0) return hash;
	for (i = 0; i < this.length; i++) {
		chr   = this.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

class SessionsPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			showAddWindow: false,
			currentSession: null,
			recap: "",
			error: "",
		};
	}

	onChangeRecap = event => {		
    	this.setState({ recap: event.target.value });
	};
	
	onSubmit = event => {
		event.preventDefault();

		let recap = {
			tags: [],
			text: this.state.recap,
			session: this.state.currentSession,
		};

		this.setState({
			recap: "",
		});

		// Add locally
		let sessions = this.props.sessions;
		let session = sessions[this.state.currentSession];
		let id = recap.text.hashCode();

		session.recaps[id] = recap;
		//session.recapCounter ++;

		sessions[this.state.currentSession] = session;
		this.props.handleSessions(sessions);
		
		// Add to Firestore Sessions
		
		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).collection("sessions")
		.doc(this.state.currentSession).update({
			['recaps.' + id]: recap,
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});
	};

	render() {

		let sessionsPage = this;

		let sessions;

		if(!this.props.campaign.sessions) {
			sessions = <div></div>;
		} else {

			// Sort keys in date order
			let sortedKeys = Object.keys(this.props.campaign.sessions).sort((a, b) => {				
				return this.props.campaign.sessions[b].date.toDate() - this.props.campaign.sessions[a].date.toDate();
			});

			sessions = sortedKeys.map((sessionID)=>
				<SessionItem 
					key = {sessionID}
					session = {this.props.campaign.sessions[sessionID]}
					click = {() => sessionsPage.setState({currentSession: sessionID})}
				/>
			);
		}

		let recapItems;

		if(!this.state.currentSession) {
			recapItems = <div></div>;
		} else if(!this.props.sessions[this.state.currentSession].recaps) {
			recapItems = <div></div>;
		} else if(this.props.sessions[this.state.currentSession].recaps.length === 0) {
			recapItems = <div></div>;	 
		} else {
			console.log(this.props.sessions[this.state.currentSession]);
			let recapList = this.props.sessions[this.state.currentSession].recaps;
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

		const { recap, error} = this.state;

		const isInvalid = recap === "" || !this.state.currentSession;

		return (
			<Row>
				<Col md={3}>
					{sessions}
					<div className="center">
						<Button variant="success" onClick={() => this.setState({ showAddWindow: true })}>New Session</Button>
					</div>
					<NewSession 
						show = {this.state.showAddWindow}
						onHide = {() => this.setState({ showAddWindow: false })}
						sessions = {this.props.sessions}
						handleSessions = {this.props.handleSessions}
						campaign = {this.props.campaign}
						handleCampaign = {this.props.handleCampaign}
						id = {this.props.id}
					/>
				</Col>
				<Col md={9}>
					{recapItems}
					<Form onSubmit={this.onSubmit}>
						<Form.Group controlId="formRecap">
							<Form.Control 
								name="recap"
								value={recap}
								onChange={this.onChangeRecap}
								type="text"
								placeholder="Write something that happened..."
							/>
						</Form.Group>
						
						<Button variant="success" type="submit" disabled={isInvalid}>
							Submit
						</Button>

						{error && <p>{error.message}</p>}
					</Form>
				</Col>
			</Row>
		);
	}
}

export default withFirebase(SessionsPage)