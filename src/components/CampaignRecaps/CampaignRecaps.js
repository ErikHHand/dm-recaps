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
			id: this.props.location.state.id,
		};

		this.handleSessions = this.handleSessions.bind(this);
	}

	componentDidMount() {

		let campaign = this;

        // Query for getting the wishlist collection from firestore
        let campaignRef = this.props.firebase.db.collection("users")
        .doc(this.props.firebase.auth.currentUser.uid).collection("campaigns").doc(this.state.id);

        campaignRef.get().then(function(doc) {
			if (doc.exists) {
				campaign.setState({
					campaign: doc.data(),
				})
				console.log("Document data:", doc.data());
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
			}
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});
	}

	handleSessions(sessions) {
		let campaign = this.state.campaign;
		campaign.sessions = sessions;
		console.log(campaign);
		this.setState({
			campaign: campaign,
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
								sessions = {this.state.campaign.sessions}
								handleSessions = {this.handleSessions}
								id = {this.state.id}
							/>
						</Tab.Pane>
						<Tab.Pane eventKey="tags">
							<TagsPage
								sessions = {this.state.campaign.sessions}
								handleSessions = {this.handleSessions}
								id = {this.state.id}
							/>
						</Tab.Pane>
					</Tab.Content>
						
					
				</Tab.Container>
				
			</Jumbotron>
		)
	}
}

export default withFirebase(CampaignRecaps)