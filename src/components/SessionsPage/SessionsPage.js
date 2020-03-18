import React, { Component } from 'react';

import SessionInfo from '../SessionInfo/SessionInfo';
import SessionItem from '../SessionItem/SessionItem';
import RecapItem from '../RecapItem/RecapItem';
import NewRecap from '../NewRecap/NewRecap';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

// Function for hashing strings.
// Used to create ID:s for the recap Items
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

/*
	This component holds the session tab of the App.
	This component also keeps track of the current session selected,
	controlling where recaps are currently written
*/
class SessionsPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			showSessionInfo: false,
			currentSession: null,
			edit: false,
		};

		// Set the context for "this" for the following functions
		this.handleCurrentSession = this.handleCurrentSession.bind(this);
		this.editSession = this.editSession.bind(this);
	}

	// Handles changing which session is the current session
	handleCurrentSession(sessionID) {
		if(sessionID == null || this.props.sessions[sessionID]) {
			this.setState({
				currentSession: sessionID,
				FUCKINGHELL: "FUCKHELL" + sessionID,
			});
		}
	}

	// Triggers before editing a session
	editSession(sessionID, description, date) {
		this.setState({
			sessionID: sessionID,
			description: description,
			date: date,
			edit: true,
			showSessionInfo: true,
		});
	}

	render() {	

		let sessions;

		// Render session items
		if(!this.props.campaign.sessions) {
			sessions = <div></div>;
		} else {
			sessions = this.props.campaign.sessionOrder.map((sessionID)=>
				<SessionItem 
					key = {sessionID}
					sessionID = {sessionID}
					sessionInfo = {this.props.campaign.sessions[sessionID]}
					sessions = {this.props.sessions}
					tags = {this.props.tags}
					campaign = {this.props.campaign}
					handleSessions = {this.props.handleSessions}
					handleTags = {this.props.handleTags}
					handleCampaign = {this.props.handleCampaign}
					handleCurrentSession = {this.handleCurrentSession}
					editSession = {this.editSession}
					campaignRef = {this.props.campaignRef}
					click = {() => this.handleCurrentSession(sessionID)}
				/>
			);
		}

		let recapItems;

		// Render recapItems
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
					campaign = {this.props.campaign}
					sessions = {this.props.sessions}
					tags = {this.props.tags}
					handleCampaign = {this.props.handleCampaign}
					handleSessions = {this.props.handleSessions}
					handleTags = {this.props.handleTags}
					campaignRef = {this.props.campaignRef}
				/>
			);
		}

		return (
			<Row>
				<Col md={3} className="overflow-scroll">
					{sessions}
					<div className="center">
						<Button variant="success" onClick={() => this.setState({ showSessionInfo: true, edit: false, })}>New Session</Button>
					</div>
					<SessionInfo 
						show = {this.state.showSessionInfo}
						onHide = {() => this.setState({ showSessionInfo: false })}
						sessions = {this.props.sessions}
						campaign = {this.props.campaign}
						handleSessions = {this.props.handleSessions}
						handleCampaign = {this.props.handleCampaign}
						campaignRef = {this.props.campaignRef}
						edit = {this.state.edit}
						description = {this.state.edit ? this.state.description : ""}
						date = {this.state.edit ? this.state.date : new Date()}
						sessionID = {this.state.edit ? this.state.sessionID : null}
					/>
				</Col>
				<Col md={9} className="overflow-scroll">
					{recapItems}
					<NewRecap 
						currentSession = {this.state.currentSession}
						sessions = {this.props.sessions}
						campaign = {this.props.campaign}
						handleSessions = {this.props.handleSessions}
						handleCampaign = {this.props.handleCampaign}
						campaignRef = {this.props.campaignRef}
					/>
				</Col>
			</Row>
		);
	}
}

export default withFirebase(SessionsPage)