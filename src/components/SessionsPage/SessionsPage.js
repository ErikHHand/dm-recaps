import React, { Component } from 'react';

import SessionInfo from '../SessionInfo/SessionInfo';
import SessionItem from '../SessionItem/SessionItem';
import RecapItem from '../RecapItem/RecapItem';
import RecapNew from '../RecapNew/RecapNew';
import SortArrowsColumn from '../SortArrowsColumn/SortArrowsColumn';


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
	controlling where recaps are written
*/
class SessionsPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			showSessionInfo: false,
			selectedSession: null,
			edit: false,
			sessionSortDescending: true,
			recapSortDescending: false,
		};

		// Set the context for "this" for the following functions
		this.handleSelectedSession = this.handleSelectedSession.bind(this);
		this.editSession = this.editSession.bind(this);
		this.addSession = this.addSession.bind(this);
		this.changeSort = this.changeSort.bind(this);
	}

	// Handles changing which session is the selected session
	handleSelectedSession(sessionID) {
		if(sessionID == null || this.props.sessions[sessionID]) {
			this.setState({
				selectedSession: sessionID,
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

	// Triggers before adding a session
	addSession() {
		this.setState({
			sessionID: null,
			description: "",
			date: new Date(),
			edit: false,
			showSessionInfo: true,
		});
	}

	changeSort(list) {
		this.setState({
			[list]: !this.state[list],
		});
	}

	render() {	

		let sessionItems;

		// Render session items
		if(!this.props.campaign.sessions) {
			sessionItems = <div></div>;
		} else {
			let sessionOrder = [...this.props.campaign.sessionOrder];
			if(!this.state.sessionSortDescending) {
				sessionOrder.reverse();
			}

			sessionItems = sessionOrder.map((sessionID)=>
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
					handleSelectedSession = {this.handleSelectedSession}
					isCurrentSession = {this.state.selectedSession === sessionID}
					editSession = {this.editSession}
					campaignRef = {this.props.campaignRef}
					click = {() => this.handleSelectedSession(sessionID)}
				/>
			);
		}

		let recapItems;

		// Render recapItems
		if(!this.state.selectedSession) {
			recapItems = <div></div>;
		} else if(!this.props.sessions[this.state.selectedSession]) {
			recapItems = <div></div>;
		} else if(this.props.sessions[this.state.selectedSession].recaps.length === 0) {
			recapItems = <div></div>;	 
		} else {

			let recapList = this.props.sessions[this.state.selectedSession].recaps;
			let recapOrder = [...this.props.campaign.sessions[this.state.selectedSession].recapOrder];

			if(this.state.recapSortDescending) {
				recapOrder.reverse();
			}

			recapItems = recapOrder.map((recapID)=>
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
			<Row noGutters={true}>
				<Col lg={3} md={4} className="remove-padding">
					<div className="border-bottom border-right">
						<SortArrowsColumn
							status = {this.state.sessionSortDescending}
							changeSort = {() => this.changeSort("sessionSortDescending")}
							alphabetical = {false}
						/>
						<div className="session-item-list remove-scroll-bar">
							{sessionItems}
						</div>
					</div>
					
					<div className="center add-session">
						<Button variant="success" onClick={this.addSession}>New Session</Button>
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
						description = {this.state.description}
						date = {this.state.date}
						sessionID = {this.state.sessionID}
					/>
				</Col>
				<Col lg={9} md={8} className="remove-padding recap-item-column border-bottom">
					<SortArrowsColumn
						status = {this.state.recapSortDescending}
						changeSort = {() => this.changeSort("recapSortDescending")}
						alphabetical = {false}
					/>
					<div className="recap-item-list remove-scroll-bar">
						{this.state.recapSortDescending ? null : recapItems}
						<RecapNew 
							session = {this.state.selectedSession}
							sessions = {this.props.sessions}
							campaign = {this.props.campaign}
							handleSessions = {this.props.handleSessions}
							handleCampaign = {this.props.handleCampaign}
							campaignRef = {this.props.campaignRef}
						/>
						{this.state.recapSortDescending ? recapItems : null}
					</div>
				</Col>
			</Row>
		);
	}
}

export default withFirebase(SessionsPage)