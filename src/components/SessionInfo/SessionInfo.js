import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal'
import { Form, Button } from 'react-bootstrap';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase';


class SessionInfo extends Component {

	constructor(props) {
		super(props);

		this.state = {
			date: new Date(),
			description: "",
			error: null,
		}
	}

	componentDidMount() {

		if(this.props.edit) {
			this.setState({
				description: this.props.description,
				date: this.props.date,
			});
		}
	}

	onSubmit = event => {

		this.props.onHide();
		event.preventDefault();

		if(this.props.edit) {
			this.editSessionInfo(this.props.sessionID);
		} else {
			this.addNewSession();
		}
	}
	
	addNewSession() {

		let session = {
			recaps: {},
		};
		
		// Add to Firestore and then add locally
		
		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).collection("sessions").add(session)
		.then((docRef) => {
			console.log("Document successfully written! DocRef: ", docRef);

			// Add session locally

			let sessions = this.props.sessions;
			sessions[docRef.id] = session;
			this.props.handleSessions(sessions);

			// Write session info

			this.editSessionInfo(docRef.id);
		})
		.catch(error => {
			console.error("Error writing document: ", error);
		});
	};

	editSessionInfo(sessionID) {

		let campaign = this.props.campaign;
		let sessionInfo;

		if(campaign.sessions[sessionID]) {
			sessionInfo = {
				created: campaign.sessions[sessionID].created,
				date: firebase.firestore.Timestamp.fromDate(this.state.date),
				description: this.state.description,
				recapOrder: campaign.sessions[sessionID].recapOrder,
			}

			let sessionIndex = campaign.sessionOrder.indexOf(sessionID);
			if (sessionIndex !== -1) campaign.sessionOrder.splice(sessionIndex, 1);
		} else {
			sessionInfo = {
				created: firebase.firestore.Timestamp.fromDate(new Date()),
				date: firebase.firestore.Timestamp.fromDate(this.state.date),
				description: this.state.description,
				recapOrder: [],
			}
		}
		

		// Sort session in date order
		
		let session;

		if(campaign.sessionOrder.length === 0 
			|| campaign.sessions[campaign.sessionOrder[campaign.sessionOrder.length - 1]].date.toDate() > sessionInfo.date.toDate()) {

			campaign.sessionOrder.splice(campaign.sessionOrder.length, 0, sessionID);
		} else {
			for(let i = 0; i < campaign.sessionOrder.length; i++) {
				session = campaign.sessions[campaign.sessionOrder[i]];
				
				if(session.date.toDate().getTime() <= sessionInfo.date.toDate().getTime()) {
					campaign.sessionOrder.splice(i, 0, sessionID);
					break;
				}
			}
		}
		

		// Add session locally

		campaign.sessions[sessionID] = sessionInfo;
		this.props.handleCampaign(campaign);

		// Add session in campaign document

		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).update({
			['sessions.' + sessionID]: sessionInfo,
			sessionOrder: campaign.sessionOrder,
		}).then(function() {
		console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});
	}
	
	onChangeDate = date => {		
    	this.setState({ date: date });
  	};

	onChangeDescription = event => {		
    	this.setState({ description: event.target.value });
  	};
	

	render() {

		let title, submit;

		if(this.props.edit) {
			title = "Edit Session";
			submit = "Submit changes";
		} else {
			title = "Add a new session";
			submit = "Add new session";
		}

		const { date, description, error } = this.state;

		const isInvalid = date === "" || description === "";

		return (
			<Modal
				show={this.props.show}
				onHide={this.props.onHide}
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					{title}
				</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<h4>Hope you had a great adventure!</h4>
					<Form onSubmit={this.onSubmit}>
						<Form.Group controlId="formSessionDate">
							<Form.Label>Date</Form.Label>
							<DatePicker
								id="example-datepicker" 
								dateFormat="yyyy/MM/dd"
								selected={date} 
								onChange={this.onChangeDate}
							/>
						</Form.Group>

						<Form.Group controlId="formDescription">
							<Form.Label>Description</Form.Label>
							<Form.Control 
								name="description"
								value={description}
								onChange={this.onChangeDescription}
								type="text"
								placeholder="Description..."
							/>
							<Form.Text className="text-muted">
								For example "The third and fourth day in the Misty Mountains".
							</Form.Text>
						</Form.Group>
						
						<Button variant="success" type="submit" disabled={isInvalid}>
							{submit}
						</Button>

						{error && <p>{error.message}</p>}
					</Form>
				</Modal.Body>
			</Modal>
		)
	}
}

export default withFirebase(SessionInfo);