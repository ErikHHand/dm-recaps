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
			campaign: this.props.location.state.campaign,
			sessions: {},
			id: this.props.location.state.id,
		};

		this.handleSessions = this.handleSessions.bind(this);
	}

	componentDidMount() {

		let campaign = this;

        // Query for getting the wishlist collection from firestore
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
			console.log(this.state.sessions);
						
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
								handleSessions = {this.handleSessions}
								id = {this.state.id}
								campaign = {this.state.campaign}
							/>
						</Tab.Pane>
						<Tab.Pane eventKey="tags">
							<TagsPage
								sessions = {this.state.sessions}
								handleSessions = {this.handleSessions}
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