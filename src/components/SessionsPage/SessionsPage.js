import React, { Component } from 'react';

import NewSession from '../NewSession/NewSession';
import SessionItem from '../SessionItem/SessionItem';
import RecapItem from '../RecapItem/RecapItem';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase';

class SessionsPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			showAddWindow: false,
			id: this.props.id,
			currentSession: null,
			recap: "",
			error: "",
		};
	}

	onChangeRecap = event => {		
    	this.setState({ recap: event.target.value });
	};
	
	onSubmit = event => {
		event.preventDefault();

		let recap = {
			tags: [],
			text: this.state.recap,
		};

		this.setState({
			recap: "",
		});

		// Add locally
		let sessions = this.props.sessions;
		let session = sessions[this.state.currentSession];
		let id = session.recapCounter;

		session.recaps[id] = recap;
		session.recapCounter ++;

		sessions[this.state.currentSession] = session;
		this.props.handleSessions(sessions);
		
		// Add to Firestore and then add locally
		
		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).collection("sessions")
		.doc(this.state.currentSession).update({
			['recaps.' + id]: recap,
			recapCounter: firebase.firestore.FieldValue.increment(1)
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});
	};

	render() {

		let sessionsPage = this;

		let sessions;

		if(!this.props.sessions) {
			sessions = <div></div>;
		} else {
			sessions = Array.from(Object.keys(this.props.sessions)).map((sessionID)=>
				<SessionItem 
					key = {sessionID}
					session = {this.props.sessions[sessionID]}
					click = {() => sessionsPage.setState({currentSession: sessionID})}
				/>
			);
		}

		let recapItems;


		if(!this.state.currentSession) {
			recapItems = <div></div>;
		} else if(!this.props.sessions[this.state.currentSession].recaps) {
			recapItems = <div></div>;
		} else if(this.props.sessions[this.state.currentSession].recaps.length === 0) {
			recapItems = <div></div>;	 
		} else {
			console.log(this.props.sessions[this.state.currentSession]);
			let recapList = this.props.sessions[this.state.currentSession].recaps;
			recapItems = Array.from(Object.keys(recapList)).map((recapID)=>
				<RecapItem 
					key = {recapID}
					recapItem = {recapList[recapID]}
					tags = {this.props.campaign.tags}
				/>
			);
		}

		const { recap, error} = this.state;

		const isInvalid = recap === "" || !this.state.currentSession;

		return (
			<Row>
				<Col md={3}>
					{sessions}
					<div className="center">
						<Button variant="success" onClick={() => this.setState({ showAddWindow: true })}>New Session</Button>
					</div>
					<NewSession 
						show = {this.state.showAddWindow}
						onHide = {() => this.setState({ showAddWindow: false })}
						sessions = {this.props.sessions}
						handleSessions = {this.props.handleSessions}
						id = {this.state.id}
					/>
				</Col>
				<Col md={9}>
					{recapItems}
					<Form onSubmit={this.onSubmit}>
						<Form.Group controlId="formRecap">
							<Form.Control 
								name="recap"
								value={recap}
								onChange={this.onChangeRecap}
								type="text"
								placeholder="Write something that happened..."
							/>
						</Form.Group>
						
						<Button variant="success" type="submit" disabled={isInvalid}>
							Submit
						</Button>

						{error && <p>{error.message}</p>}
					</Form>
				</Col>
			</Row>
		);
	}
}

export default withFirebase(SessionsPage)