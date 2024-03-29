import React, { Component } from 'react';

import SessionInfo from '../SessionInfo/SessionInfo';
import SessionItem from '../SessionItem/SessionItem';
import RecapItem from '../RecapItem/RecapItem';
import RecapNew from '../RecapNew/RecapNew';
import SortArrowsColumn from '../SortArrowsColumn/SortArrowsColumn';
import Spinner from 'react-bootstrap/Spinner'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { withFirebase } from '../Firebase/Firebase';

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
		this.scrollToBottomOfRecaps = this.scrollToBottomOfRecaps.bind(this);
	}

	// Change sorting of a list
	changeSort(list) {
		this.setState({
			[list]: !this.state[list],
		});
	}

	// Function for automatically scrolling to the bottom of the recaps list
	// This is called when adding a new recap and will scroll when recaps
	// are sorted in ascending order
	scrollToBottomOfRecaps() {
		if(!this.state.recapSortDescending) {
			this.recapsList.scrollTop = this.recapsList.scrollHeight;
		}
	}

	render() {	

		// Render session items
		let sessionItems = <></>;
		let recapItems = <></>;
		let recapNew = <></>;

		let smallScreen = window.innerWidth < 576;

		switch (this.props.status) {
			case "LOADING":
				sessionItems =
					<div className="loading-spinner center-vertically">
						<Spinner animation="grow" variant="info" role="status">
							<span className="sr-only">Loading...</span>
						</Spinner>
					</div>
					
				recapItems = 	
					<div className="loading-spinner center-vertically">
						<Spinner animation="grow" variant="info" role="status">
							<span className="sr-only">Loading...</span>
						</Spinner>
					</div>
				break;
			case "LOADED":
				recapNew = 
					<RecapNew 
						session = {this.props.selectedSession}
						sessions = {this.props.sessions}
						campaign = {this.props.campaign}
						handleSessions = {this.props.handleSessions}
						handleCampaign = {this.props.handleCampaign}
						handleError = {this.props.handleError}
						campaignRef = {this.props.campaignRef}
						loadCampaign = {this.props.loadCampaign}
						scrollToBottomOfRecaps = {this.scrollToBottomOfRecaps}
					/>

				if(!this.props.campaign.sessions) {
					sessionItems = <></>;
				} else {
		
					// Create a copy of the list so it can be sorted 
					let sessionOrder = [...this.props.campaign.sessionOrder]; 
					if(!this.state.sessionSortDescending) {
						sessionOrder.reverse();
					}
		
					sessionItems = sessionOrder.map((sessionID) =>
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
							handleError = {this.props.handleError}
							isSelectedSession = {this.props.selectedSession === sessionID}
							campaignRef = {this.props.campaignRef}
							loadCampaign = {this.props.loadCampaign}
							click = {() => {
								this.props.handleSelectedSession(sessionID);
								this.props.handleTransition("slide-to-recaps");
							}}
						/>
					);
				}
		
				// Render recap items		
				if(!this.props.selectedSession) {
					recapItems = <></>;
				} else if(!this.props.sessions[this.props.selectedSession]) {
					recapItems = <></>;
				} else if(this.props.sessions[this.props.selectedSession].recaps.length === 0) {
					recapItems = <></>;	 
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
							handleError = {this.props.handleError}
							campaignRef = {this.props.campaignRef}
							loadCampaign = {this.props.loadCampaign}
						/>
					);
				}
				break;
			default:
				sessionItems = <p>Failed to load data, please reload the page or check your internet connection.</p>
				break;
		}

		return (
			<>
				<Row className="remove-margin height-100">
					<Col xl={3} md={4} sm={5} xs={12} className="remove-padding height-100">
						<div className="border-right height-100">
							<SortArrowsColumn
								status = {this.state.sessionSortDescending}
								changeSort = {() => this.changeSort("sessionSortDescending")}
								alphabetical = {false}
							/>
							<div className="item-list remove-scroll-bar">
								<div 
									className="session-add-button item-add-button" 
									onClick={() => this.setState({showSessionInfo: true})}
								>
									<FontAwesomeIcon icon={faPlus}/>
								</div>
								{sessionItems}
							</div>
						</div>
					</Col>
					<Col 
						xl={9} md={8} sm={7} xs={12} 
						className="remove-padding height-100 recaps-column"
						style={this.props.showAlert && smallScreen ? 
							{bottom: "calc(96.5vh - 116px - " + this.props.alertHeight + "px)"} 
							: {}}
					>
						<SortArrowsColumn
							status = {this.state.recapSortDescending}
							changeSort = {() => this.changeSort("recapSortDescending")}
							alphabetical = {false}
						/>
						<div 
							className="item-list remove-scroll-bar"
							ref={recapsList => this.recapsList = recapsList}
						>
							{this.state.recapSortDescending ? null : recapItems}
							{recapNew}
							{this.state.recapSortDescending ? recapItems : null}
						</div>
					</Col>
				</Row>

				<SessionInfo 
					show = {this.state.showSessionInfo}
					onHide = {() => this.setState({ showSessionInfo: false })}
					sessions = {this.props.sessions}
					campaign = {this.props.campaign}
					handleSessions = {this.props.handleSessions}
					handleCampaign = {this.props.handleCampaign}
					handleSelectedSession = {this.props.handleSelectedSession}
					handleError = {this.props.handleError}
					campaignRef = {this.props.campaignRef}
					edit = {false}
					loadCampaign = {this.props.loadCampaign}
				/>
			</>
		);
	}
}

export default withFirebase(SessionsPage)