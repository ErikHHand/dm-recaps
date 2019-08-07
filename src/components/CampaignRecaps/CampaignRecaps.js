import React, { Component } from 'react';

import SessionsPage from '../SessionsPage/SessionsPage';
import TagsPage from '../TagsPage/TagsPage';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Tab from 'react-bootstrap/Tab'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'

import { withFirebase } from '../Firebase/Firebase';


/*
	This class holds the global state for this App.
	Here is where campaign, tag and session data is stored 
	and managed. This class also handles the switching between tabs
	and renders the tags page and the session page components.
*/
class CampaignRecaps extends Component {

	constructor(props) {
		super(props);

		this.state = {
			key: 'sessions',
			campaignRef: null,
			campaign: {},
			sessions: {},
			tags: {},
			id: this.props.location.state.id,
		};

		// Set the context for "this" for the following functions
		this.handleSessions = this.handleSessions.bind(this);
		this.handleCampaign = this.handleCampaign.bind(this);
		this.handleTags = this.handleTags.bind(this);
	}

	/*
		When component mounts, get the Firestore refernece for this campaign.
		Then get the campaign, the sessions and the tags and save in the state
	*/
	componentDidMount() {

		let campaign = this;

		// The id for this campaign
		let id = this.props.location.state.id;

		// The Firestore database reference for this campaign
		let campaignRef = this.props.firebase.db.collection("users")
		.doc(this.props.firebase.auth.currentUser.uid).collection("campaigns").doc(id);

		// Save the reference for this campaign in the state
		this.setState({
			campaignRef: campaignRef,
		});

		// Get the campaign for Firestore and save in the state
		campaignRef.get()
		.then((doc) => {
			campaign.setState({
				campaign: doc.data(),
			});
		});

        // Query for getting the sessions collection from Firestore
		campaignRef.collection("sessions").get().then((querySnapshot) => {
            let sessions = {};

            // Get all entries in the sessions collection
            querySnapshot.forEach((doc) => {
                sessions[doc.id] = doc.data();
            });

			// Save the sessions in the state
            campaign.setState({
                sessions: sessions,
			});			
        }).catch((error) => {
            console.log("Error getting document:", error);
		});
		
		// Query for getting the tags collection from firestore
		campaignRef.collection("tags").get().then((querySnapshot) => {
            let tags = {};

            // Get all entries in the tags collection
            querySnapshot.forEach((doc) => {
                tags[doc.id] = doc.data();
            });

			// Save the tags in the state
            campaign.setState({
                tags: tags,
			});		
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
	}

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

	render() {
		return (
			<Jumbotron fluid className="container">
				<Tab.Container defaultActiveKey="sessions">
					<Row>
						<Col>
							<Nav variant="tabs" className="justify-content-center">
								<Nav.Item>
									<Nav.Link eventKey="sessions">Sessions</Nav.Link>
								</Nav.Item>
								<Nav.Item>
									<Nav.Link eventKey="tags">Tags</Nav.Link>
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
								campaignID = {this.props.location.state.id}
								campaignRef = {this.state.campaignRef}
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
								campaignID = {this.props.location.state.id}
								campaignRef = {this.state.campaignRef}
							/>
						</Tab.Pane>
					</Tab.Content>
				</Tab.Container>
			</Jumbotron>
		)
	}
}

export default withFirebase(CampaignRecaps)