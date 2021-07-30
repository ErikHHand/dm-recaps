import React, { Component } from 'react';

import SessionsPage from '../SessionsPage/SessionsPage';
import TagsPage from '../TagsPage/TagsPage';
import Navbar from '../Navbar/Navbar';

import Tab from 'react-bootstrap/Tab'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'

import { withFirebase } from '../Firebase/Firebase';


/*
	This class holds the global state for this App.
	This is where campaign, tag and session data is stored 
	and managed. This class also handles the switching between tabs
	and renders the tag page and the session page components.
*/
class CampaignRecaps extends Component {

	constructor(props) {
		super(props);

		this.state = {
			status: "LOADING",
			campaign: {},
			sessions: {},
			tags: {},
			selectedSession: null,
			selectedTag: null,
		};

		// Set the context for "this" for the following functions
		//this.downloadCampaign = this.downloadCampaign.bind(this);
		this.handleSessions = this.handleSessions.bind(this);
		this.handleCampaign = this.handleCampaign.bind(this);
		this.handleTags = this.handleTags.bind(this);
		this.setActiveTab = this.setActiveTab.bind(this);
		this.handleSelectedSession = this.handleSelectedSession.bind(this);
		this.handleSelectedTag = this.handleSelectedTag.bind(this);
	}


	// When component mounts, get the Firestore reference for this campaign.
	// Then get the campaign, the sessions and the tags and save in the state
	componentDidMount() {

		let campaign = this;

		// The id for this campaign, talen from the pathname
		let campaignID = this.props.location.pathname.substring(11);

		// Set the correct Firestore database reference for this campaign
		let campaignRef = this.props.firebase.db.collection("campaigns").doc(campaignID);

		// Get the campaign for Firestore and save in the state
		// This is done by getting all recap docuements from the recaps collection
		// and then sorting them into both session and tag objects based on what session the
		// recap belongs to and what tags are atached to it
		campaignRef.get().then((campaginDoc) => {
			campaignRef.collection("recaps").get().then((querySnapshot) => {
				let sessions = {};
				let tags = {};
				let recaps = {};

				// Fill tag and session objects with empty objects in preparation for
				// copying over recaps
				for (let tagID in campaginDoc.data().tags) {
					tags[tagID] = {};
					tags[tagID]["recaps"] = {};
					
				}
				for (let sessionID in campaginDoc.data().sessions) {
					sessions[sessionID] = {};
					sessions[sessionID]["recaps"] = {};
				}

				// Loop over all recaps and put them in sessions, tags and recaps objects
				querySnapshot.forEach((doc) => {
					sessions[doc.data().session].recaps[doc.id] = doc.data();
					for (let i = 0; i < doc.data().tags.length; i++) {
						tags[doc.data().tags[i]].recaps[doc.id] = doc.data();
					}
					recaps[doc.id] = doc.data();
				});

				// Save data in the state and set status to "LOADED"
				campaign.setState({
					status: "LOADED",
					recaps: recaps,
					sessions: sessions,
					tags: tags,
					campaign: campaginDoc.data(),
					selectedSession: campaginDoc.data().selectedSession,
					selectedTag: campaginDoc.data().selectedTag,
				});
			}).catch((error) => {
				console.log("Error getting document:", error);
			});	
		});	
	}

	componentWillUnmount() {

		// Check if user is signed in
		if(this.props.firebase.auth.currentUser) {
			// The id for this campaign
			let campaignID = this.props.location.pathname.substring(11);

			// The Firestore database reference for this campaign
			let campaignRef = this.props.firebase.db.collection("campaigns").doc(campaignID);

			let userRef = this.props.firebase.db.collection("users")
			.doc(this.props.firebase.auth.currentUser.uid);

			// Update info about active tab and selected session/tag to backend
			campaignRef.update({
				activeTab: this.state.campaign.activeTab, 
				selectedSession: this.state.selectedSession ? this.state.selectedSession : "",
				selectedTag: this.state.selectedTag ? this.state.selectedTag : "",
			}).then(() => {
				console.log("Document successfully updated!");
			}).catch((error) => {
				console.log("Error getting document:", error);
			});

			// Update info about last visited campaign to backend
			userRef.update({
				lastCampaignName: this.state.campaign ? this.state.campaign.name : "",
				lastCampaignID: campaignID,
			}).then(() => {
				console.log("Document successfully updated!");
			}).catch((error) => {
				console.log("Error getting document:", error);
			});
		}
	}

	// Function for downloading all campaign, tag and session data
	// as a JSON file
	// NOTE: Download functionality currently disabled
	/*async downloadCampaign() {

		let campaginData = {
			campaign: this.state.campaign,
			sessions: this.state.sessions,
			tags: this.state.tags,
		};

		const fileName = "campaignData";
		const json = JSON.stringify(campaginData);
		const blob = new Blob([json], {type: "application/json"});
		const href = await URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = href;
		link.download = fileName + ".json";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}*/

	// Handles changes to campaign data
	handleCampaign(campaign) {
		this.setState({
			campaign: campaign,
		})
	}

	// Handles changes to session recaps data
	handleSessions(sessions) {
		this.setState({
			sessions: sessions,
		})
	}

	// Handles changes to tag recaps data
	handleTags(tags) {
		this.setState({
			tags: tags,
		})
	}

	// Handles changes to which tab is currently shown
	setActiveTab(tab) {
		let campaign = this.state.campaign;
		campaign.activeTab = tab;
		this.setState({
			campaign: campaign,
		});
	}

	// Handles changing which session is the selected session
	handleSelectedSession(sessionID) {
		if(sessionID === null || this.state.sessions[sessionID]) {
			let campaign = this.state.campaign;
			campaign.activeTab = "sessions";
			this.setState({
				selectedSession: sessionID,
				campaign: campaign,
			});
		}
	}

	// Handles changing which tag is the selected tag
	handleSelectedTag(tagID) {
		if(tagID === null || this.state.tags[tagID]) {
			let campaign = this.state.campaign;
			campaign.activeTab = "tags";
			this.setState({
				selectedTag: tagID,
				campaign: campaign,
			});
		}
	}

	render() {

		// The id for this campaign
		let campaignID = this.props.location.pathname.substring(11);

		// The Firestore database reference for this campaign
		let campaignRef = this.props.firebase.db.collection("campaigns").doc(campaignID);

		let title = this.state.campaign ? this.state.campaign.name : "";
		let activeTab = this.state.campaign ? this.state.campaign.activeTab : "sessions";

		return (
			<Container>
				<Navbar
					title = {title}
				/>
				<Tab.Container activeKey={activeTab} transition={false}>
					<Row className="tab-nav">
						<Col className="tab-nav-col">
							<Nav 
								variant="tabs" 
								className="justify-content-center"
								activeKey={activeTab}
							>
								<Nav.Item>
									<Nav.Link 
										eventKey="sessions"
										onSelect={() => this.setActiveTab("sessions")}
									>
										Sessions
									</Nav.Link>
								</Nav.Item>
								<Nav.Item>
									<Nav.Link 
										eventKey="tags"
										onSelect={() => this.setActiveTab("tags")}
									>
										Tags
									</Nav.Link>
								</Nav.Item>
							</Nav>
						</Col>
					</Row>
					
					<Tab.Content>
						<Tab.Pane eventKey="sessions">
							<SessionsPage
								campaign = {this.state.campaign}
								sessions = {this.state.sessions}
								tags = {this.state.tags}
								handleSessions = {this.handleSessions}
								handleCampaign = {this.handleCampaign}
								handleTags = {this.handleTags}
								campaignRef = {campaignRef}
								activeTab = {activeTab}
								selectedSession = {this.state.selectedSession}
								handleSelectedSession = {this.handleSelectedSession}
								handleSelectedTag = {this.handleSelectedTag}
								status = {this.state.status}
							/>
						</Tab.Pane>
						<Tab.Pane eventKey="tags">
							<TagsPage
								campaign = {this.state.campaign}
								sessions = {this.state.sessions}
								tags = {this.state.tags}
								handleCampaign = {this.handleCampaign}
								handleSessions = {this.handleSessions}
								handleTags = {this.handleTags}
								campaignRef = {campaignRef}
								activeTab = {activeTab}
								selectedTag = {this.state.selectedTag}
								handleSelectedSession = {this.handleSelectedSession}
								handleSelectedTag = {this.handleSelectedTag}
								status = {this.state.status}
							/>
						</Tab.Pane>
					</Tab.Content>
				</Tab.Container>
			</Container>
		)
	}
}

export default withFirebase(CampaignRecaps)