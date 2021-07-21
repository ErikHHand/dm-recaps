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
			activeTab: this.props.location.state ? this.props.location.state.activeTab : "sessions",
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

		// The id for this campaign
		let campaignID = this.props.location.state.id;

		// Set the correct Firestore database reference for this campaign
		let campaignRef = this.props.firebase.db.collection("campaigns").doc(campaignID);

		// Get the campaign for Firestore and save in the state
		campaignRef.get().then((campaginDoc) => {
			campaignRef.collection("recaps").get().then((querySnapshot) => {
				let sessions = {};
				let tags = {};
				let recaps = {};

				for (let tagID in campaginDoc.data().tags) {
					tags[tagID] = {};
					tags[tagID]["recaps"] = {};
					
				}
				for (let sessionID in campaginDoc.data().sessions) {
					sessions[sessionID] = {};
					sessions[sessionID]["recaps"] = {};
				}

				// Get all entries in the sessions collection
				querySnapshot.forEach((doc) => {
					sessions[doc.data().session].recaps[doc.id] = doc.data();
					for (let i = 0; i < doc.data().tags.length; i++) {
						tags[doc.data().tags[i]].recaps[doc.id] = doc.data();
					}
				});

				// Get all entries in the recaps collection
				querySnapshot.forEach((doc) => {
					recaps[doc.id] = doc.data();
				});

				// Save the tags, sessions and campaign in the state
				campaign.setState({
					status: "LOADED",
					recaps: recaps,
					sessions: sessions,
					tags: tags,
					campaign: campaginDoc.data(),
					activeTab: campaginDoc.data().activeTab ? campaginDoc.data().activeTab : "sessions",
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
			let campaignID = this.props.location.state.id;

			// The Firestore database reference for this campaign
			let campaignRef = this.props.firebase.db.collection("campaigns").doc(campaignID);

			let userRef = this.props.firebase.db.collection("users")
			.doc(this.props.firebase.auth.currentUser.uid);

			// Add info about active tab and session to backend
			campaignRef.update({
				activeTab: this.state.activeTab, 
				selectedSession: this.state.selectedSession ? this.state.selectedSession : "",
				selectedTag: this.state.selectedTag ? this.state.selectedTag : "",
			}).then(function() {
				console.log("Document successfully updated!");
			}).catch(function(error) {
				console.log("Error getting document:", error);
			});

			userRef.update({
				lastCampaignName: this.state.campaign ? this.state.campaign.name : "",
				lastCampaignID: this.props.location.state.id ? this.props.location.state.id: "",
			}).then(function() {
				console.log("Document successfully updated!");
			}).catch(function(error) {
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

	// Handles changes to session recap data
	handleSessions(sessions) {
		this.setState({
			sessions: sessions,
		})
	}

	// Handles changes to session recap data
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
			activeTab: tab,
			campaign: campaign,
		});
		
	}

	// Handles changing which session is the selected session
	handleSelectedSession(sessionID) {
		if(sessionID === null || this.state.sessions[sessionID]) {
			let campaign = this.state.campaign;
			campaign.activeTab = "sessions";
			this.setState({
				activeTab: "sessions",
				selectedSession: sessionID,
				campaign: campaign,
			});
		} else {
			this.setState({
				selectedSession: null,
			});
		}
	}

	// Handles changing which tag is the selected tag
	handleSelectedTag(tagID) {
		if(tagID === null || this.state.tags[tagID]) {
			let campaign = this.state.campaign;
			campaign.activeTab = "tags";
			this.setState({
				activeTab: "tags",
				selectedTag: tagID,
				campaign: campaign,
			});
		}
	}

	render() {

		// The id for this campaign
		console.log(this.props.location);
		let campaignID = this.props.location.state.id;

		// The Firestore database reference for this campaign
		let campaignRef = this.props.firebase.db.collection("campaigns").doc(campaignID);

		let title = this.state.campaign ? this.state.campaign.name : "";

		return (
			<Container>
				<Navbar
					title = {title}
				/>
				<Tab.Container activeKey={this.state.activeTab} transition={false}>
					<Row className="tab-nav">
						<Col>
							<Nav 
								variant="tabs" 
								className="justify-content-center"
								activeKey={this.state.activeTab}
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
								activeTab = {this.state.activeTab}
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
								activeTab = {this.state.activeTab}
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