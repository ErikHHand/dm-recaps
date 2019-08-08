import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal'
import { Form, Button } from 'react-bootstrap';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase';

/*
	This component holds the pop-up window for when creating a new
	and editing a session.
*/
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

		// If editing, put the current information about the session in
		// the state and also the input fields
		if(this.props.edit) {
			this.setState({
				description: this.props.description,
				date: this.props.date,
			});
		}
	}

	// Triggers when submitting session info
	onSubmit = event => {

		// Hide the session info window
		this.props.onHide();
		event.preventDefault();

		// If editing, only writing to the session field in the campaign object
		// is neccessary and a new session is not needed
		if(this.props.edit) {
			this.editSessionInfo(this.props.sessionID);
		} else {
			this.addNewSession();
		}
	}
	
	// Triggers when adding an entirely new session,
	// as opposed to editing an existing one.
	// This function saves the session locally and on Firestore
	addNewSession() {

		let session = {
			recaps: {},
		};
		
		// First add to Firestore then add locally,
		// because adding to Firestore will generate the
		// id needed to store locally
		this.props.campaignRef.collection("sessions").add(session)
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
		let sessionInfo = {
			date: firebase.firestore.Timestamp.fromDate(this.state.date),
			description: this.state.description,
		};

		// Write data depending on whether or not this a new 
		// session or an old session being edited
		if(campaign.sessions[sessionID]) {

			// Session being edited
			sessionInfo.created = campaign.sessions[sessionID].created;
			sessionInfo.recapOrder = campaign.sessions[sessionID].recapOrder;

			// Remove the session from the session order array
			let sessionIndex = campaign.sessionOrder.indexOf(sessionID);
			if (sessionIndex !== -1) campaign.sessionOrder.splice(sessionIndex, 1);
		} else {

			// New session being added
			sessionInfo.created = firebase.firestore.Timestamp.fromDate(new Date());
			sessionInfo.recapOrder = [];
		}


		// Sort session in chronological order and add it to the session order array
		
		let session;

		if(campaign.sessionOrder.length === 0 
			|| campaign.sessions[campaign.sessionOrder[campaign.sessionOrder.length - 1]].date.toDate() > sessionInfo.date.toDate()) {

			// Session is the first session chronologically
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

		this.props.campaignRef.update({
			['sessions.' + sessionID]: sessionInfo,
			sessionOrder: campaign.sessionOrder,
		}).then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});
	}
	
	// Triggers when changing the date
	onChangeDate = date => {		
    	this.setState({ date: date });
  	};

	// Triggers when changign the description
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