import React, { Component } from 'react';

import SessionInfo from '../SessionInfo/SessionInfo';
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

		this.handleCurrentSession = this.handleCurrentSession.bind(this);
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

		// Add locally to sessions
		let sessions = this.props.sessions;
		let session = sessions[this.state.currentSession];
		let id = recap.text.hashCode();

		session.recaps[id] = recap;

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

		// Add locally to recap order

		let campaign = this.props.campaign;
		campaign.sessions[this.state.currentSession].recapOrder.push(id);
		this.props.handleCampaign(campaign);

		// Add to Firestore Recap order
		
		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).update({
			['sessions.' + this.state.currentSession + '.recapOrder']: campaign.sessions[this.state.currentSession].recapOrder,
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});
	};

	handleCurrentSession(sessionID) {
		this.setState({
			currentSession: sessionID,
		})
	}

	render() {		

		let sessionsPage = this;

		let sessions;

		if(!this.props.campaign.sessions) {
			sessions = <div></div>;
		} else {
			sessions = this.props.campaign.sessionOrder.map((sessionID)=>
				<SessionItem 
					key = {sessionID}
					sessionID = {sessionID}
					session = {this.props.campaign.sessions[sessionID]}
					sessions = {this.props.sessions}
					tags = {this.props.tags}
					campaign = {this.props.campaign}
					handleSessions = {this.props.handleSessions}
					handleTags = {this.props.handleTags}
					handleCampaign = {this.props.handleCampaign}
					handleCurrentSession = {this.handleCurrentSession}
					id = {this.props.id}
					click = {() => this.setState({currentSession: sessionID})}
				/>
			);
		}

		let recapItems;

		//console.log(this.state.currentSession);
		//console.log(this.props.sessions);
		//console.log(this.props.campaign.tags);

		if(!this.state.currentSession) {
			recapItems = <div></div>;
		} else if(!this.props.sessions[this.state.currentSession]) {
			recapItems = <div></div>;
		} else if(this.props.sessions[this.state.currentSession].recaps.length === 0) {
			recapItems = <div></div>;	 
		} else {
			let recapList = this.props.sessions[this.state.currentSession].recaps;
			recapItems = this.props.campaign.sessions[this.state.currentSession].recapOrder.map((recapID)=>
				<RecapItem 
					key = {recapID}
					recapID = {recapID}
					recapItem = {recapList[recapID]}
					tags = {this.props.tags}
					sessions = {this.props.sessions}
					handleSessions = {this.props.handleSessions}
					handleTags = {this.props.handleTags}
					handleCampaign = {this.props.handleCampaign}
					id = {this.props.id}
					campaign = {this.props.campaign}
				/>
			);
		}

		const { recap, error} = this.state;

		const isInvalid = recap === "" || !this.state.currentSession;

		return (
			<Row>
				<Col md={3} className="overflow-scroll">
					{sessions}
					<div className="center">
						<Button variant="success" onClick={() => this.setState({ showAddWindow: true })}>New Session</Button>
					</div>
					<SessionInfo 
						show = {this.state.showAddWindow}
						onHide = {() => this.setState({ showAddWindow: false })}
						sessions = {this.props.sessions}
						handleSessions = {this.props.handleSessions}
						campaign = {this.props.campaign}
						handleCampaign = {this.props.handleCampaign}
						id = {this.props.id}
					/>
				</Col>
				<Col md={9} className="overflow-scroll">
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
						<p hidden={this.state.currentSession}>Click a session before writing a recap!</p>
						{error && <p>{error.message}</p>}
					</Form>
				</Col>
			</Row>
		);
	}
}

export default withFirebase(SessionsPage)