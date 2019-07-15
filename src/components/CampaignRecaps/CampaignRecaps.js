import React, { Component } from 'react';

import SessionsPage from '../SessionsPage/SessionsPage';
import TagsPage from '../TagsPage/TagsPage';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Tab from 'react-bootstrap/Tab'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'

import { withFirebase } from '../Firebase/Firebase';

class CampaignRecaps extends Component {

	constructor(props) {
		super(props);

		this.state = {
			key: 'sessions',
			campaign: {},
			sessions: {},
			tags: {},
			id: this.props.location.state.id,
		};

		this.handleSessions = this.handleSessions.bind(this);
		this.handleCampaign = this.handleCampaign.bind(this);
		this.handleTags = this.handleTags.bind(this);
	}

	componentDidMount() {

		let campaign = this;

		let campaignRef = this.props.firebase.db.collection("users")
		.doc(this.props.firebase.auth.currentUser.uid).collection("campaigns")
		.doc(this.state.id).get()
		.then((doc) => {
			campaign.setState({
				campaign: doc.data(),
			});
		});

        // Query for getting the sessions collection from firestore
        let sessionsRef = this.props.firebase.db.collection("users")
		.doc(this.props.firebase.auth.currentUser.uid).collection("campaigns").doc(this.state.id)
		.collection("sessions");
		
		sessionsRef.get().then((querySnapshot) => {
            let sessions = {};

            // Get all entries in the sessions collection
            querySnapshot.forEach((doc) => {
                sessions[doc.id] = doc.data();
            });

            campaign.setState({
                sessions: sessions,
			});
						
        }).catch((error) => {
            console.log("Error getting document:", error);
		});
		
		// Query for getting the tags collection from firestore
        let tagsRef = this.props.firebase.db.collection("users")
		.doc(this.props.firebase.auth.currentUser.uid).collection("campaigns").doc(this.state.id)
		.collection("tags");
		
		tagsRef.get().then((querySnapshot) => {
            let tags = {};

            // Get all entries in the sessions collection
            querySnapshot.forEach((doc) => {
                tags[doc.id] = doc.data();
            });

            campaign.setState({
                tags: tags,
			});
						
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
	}

	handleSessions(sessions) {
		console.log(sessions);
		this.setState({
			sessions: sessions,
		})
	}

	handleCampaign(campaign) {
		console.log(campaign);
		this.setState({
			campaign: campaign,
		})
	}

	handleTags(tags) {
		console.log(tags);
		this.setState({
			tags: tags,
		})
	}

	render() {
		console.log(this.state.campaign);
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
								sessions = {this.state.sessions}
								tags = {this.state.tags}
								handleSessions = {this.handleSessions}
								handleCampaign = {this.handleCampaign}
								handleTags = {this.handleTags}
								id = {this.state.id}
								campaign = {this.state.campaign}
							/>
						</Tab.Pane>
						<Tab.Pane eventKey="tags">
							<TagsPage
								sessions = {this.state.sessions}
								tags = {this.state.tags}
								handleCampaign = {this.handleCampaign}
								handleSessions = {this.handleSessions}
								handleTags = {this.handleTags}
								id = {this.state.id}
								campaign = {this.state.campaign}
							/>
						</Tab.Pane>
					</Tab.Content>
						
					
				</Tab.Container>
				
			</Jumbotron>
		)
	}
}

export default withFirebase(CampaignRecaps)