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
	This component holds the session tab of the app.

	This is a child component to the CampaignRecaps component, and is on
	the same level as the TagsPage component.

	This component handles rendering the list of session items and the list of
	recap items, based on the selected session. This component also handles sorting order
	for the two lists.
*/
class SessionsPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			showSessionInfo: false,
			session: {description: "", date: new Date()},
			sessionSortDescending: true,
			recapSortDescending: false,
		};

		// Set the context for "this" for the following functions
		this.changeSort = this.changeSort.bind(this);
	}

	// Change sorting of a list
	changeSort(list) {
		this.setState({
			[list]: !this.state[list],
		});
	}

	render() {	

		// Render session items
		let sessionItems;

		if(!this.props.campaign.sessions) {
			sessionItems = <div></div>;
		} else {

			// Create a copy of the list so it can be sorted 
			let sessionOrder = [...this.props.campaign.sessionOrder]; 
			if(!this.state.sessionSortDescending) { //
				sessionOrder.reverse();
			}

			sessionItems = sessionOrder.map((sessionID)=>
				<SessionItem 
					key = {sessionID}
					sessionID = {sessionID}
					sessions = {this.props.sessions}
					tags = {this.props.tags}
					campaign = {this.props.campaign}
					handleSessions = {this.props.handleSessions}
					handleTags = {this.props.handleTags}
					handleCampaign = {this.props.handleCampaign}
					handleSelectedSession = {this.props.handleSelectedSession}
					isSelectedSession = {this.props.selectedSession === sessionID}
					campaignRef = {this.props.campaignRef}
					click = {() => this.props.handleSelectedSession(sessionID)}
				/>
			);
		}

		// Render recap items
		let recapItems;

		// TODO: Check if all of these checks really are necessary anymore
		if(!this.props.selectedSession) {
			recapItems = <div></div>;
		} else if(!this.props.sessions[this.props.selectedSession]) {
			recapItems = <div></div>;
		} else if(this.props.sessions[this.props.selectedSession].recaps.length === 0) {
			recapItems = <div></div>;	 
		} else {

			// Get list of recaps and copy the recap order list so it can be sorted
			let recapList = this.props.sessions[this.props.selectedSession].recaps;
			let recapOrder = [...this.props.campaign.sessions[this.props.selectedSession].recapOrder];
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
					handleSelectedSession = {this.props.handleSelectedSession}
					handleSelectedTag = {this.props.handleSelectedTag}
					campaignRef = {this.props.campaignRef}
				/>
			);
		}

		return (
			<>
				<Row noGutters={true} className="border-bottom">
					<Col lg={3} md={4} className="remove-padding list-height">
						<div className="border-right session-list-column">
							<SortArrowsColumn
								status = {this.state.sessionSortDescending}
								changeSort = {() => this.changeSort("sessionSortDescending")}
								alphabetical = {false}
							/>
							<div className="item-list remove-scroll-bar">
								{sessionItems}
							</div>
						</div>
					</Col>
					<Col lg={9} md={8} className="remove-padding list-height">
						<SortArrowsColumn
							status = {this.state.recapSortDescending}
							changeSort = {() => this.changeSort("recapSortDescending")}
							alphabetical = {false}
						/>
						<div className="item-list remove-scroll-bar">
							{this.state.recapSortDescending ? null : recapItems}
							<RecapNew 
								session = {this.props.selectedSession}
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

				<div className="center add-button">
					<Button 
						variant="success" 
						onClick={() => this.setState({showSessionInfo: true})}
					>
						New Session
					</Button>
				</div>
				<SessionInfo 
					show = {this.state.showSessionInfo}
					onHide = {() => this.setState({ showSessionInfo: false })}
					sessions = {this.props.sessions}
					campaign = {this.props.campaign}
					handleSessions = {this.props.handleSessions}
					handleCampaign = {this.props.handleCampaign}
					campaignRef = {this.props.campaignRef}
					edit = {false}
				/>
			</>
		);
	}
}

export default withFirebase(SessionsPage)