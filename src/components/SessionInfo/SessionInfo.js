import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal'
import { Form, Button } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert'

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase';

/*
	This component holds the pop-up window for when creating a new session
	or editing an existing session.
*/
class SessionInfo extends Component {

	constructor(props) {
		super(props);

		this.state = {
			error: null,
			description: "",
			date: new Date(),
			showAlert: false,
		}

		// Set the context for "this" for the following function
		this.onSubmit = this.onSubmit.bind(this);
		this.onChangeDate = this.onChangeDate.bind(this);
		this.onChangeDescription = this.onChangeDescription.bind(this);
	}

	// Will be called when component mounts, and put necessary information in the state
	// if a session is being edited
	componentDidMount() {

		// Put the current information about the session in the state
		if(this.props.edit) {
			this.setState({
				description: this.props.session.description,
				date: new Date(this.props.session.date.seconds * 1000),
			});
		}
	}

	// Function for hashing strings.
	// Used to create ID:s for the recap Item
	hashCode(string) {

		let hash = 0;
		let chr;

		if (string.length === 0) return hash;

		for (let i = 0; i < string.length; i++) {
			chr = string.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}

		return hash;
	};

	// Triggers when submitting session info
	onSubmit(event){

		event.preventDefault();

		// The info to be saved with the session
		let sessionInfo = {
			date: firebase.firestore.Timestamp.fromDate(this.state.date),
			description: this.state.description,
		};

		// If editing, only writing to the session field in the campaign object
		if(this.props.edit) {
			this.editSessionInfo(this.props.sessionID, sessionInfo);
		} else {
			this.addNewSession(sessionInfo);
		}
	}
	
	// Triggers when adding an entirely new session
	// This function saves the session locally and on Firestore
	addNewSession(sessionInfo) {

		// Generate sesion ID
		let sessionID = this.hashCode(sessionInfo.description).toString();

		// Check if session with this description already exists
		if(this.props.sessions[sessionID]) {
			this.setState({showAlert: true,})
			return;
		}

		// Write session info
		this.editSessionInfo(sessionID, sessionInfo);

		// Reset the state
		this.setState({
			error: null,
			description: "",
			date: new Date(),
		});
	};

	// Triggers when editing a session or just after a new session has been added.
	// This function saves the session info locally and on Firestore
	editSessionInfo(sessionID, sessionInfo) {

		// Hide the session info window
		this.props.onHide();

		let campaign = this.props.campaign;
		let sessions = this.props.sessions;
		let sessionOrder = [...campaign.sessionOrder];

		// Write data depending on whether or not this a new 
		// session or an old session being edited
		if(campaign.sessions[sessionID]) {

			// Session being edited
			sessionInfo.created = campaign.sessions[sessionID].created;
			sessionInfo.recapOrder = campaign.sessions[sessionID].recapOrder;

			// Remove the session from the session order array
			let sessionIndex = sessionOrder.indexOf(sessionID);
			if (sessionIndex !== -1) sessionOrder.splice(sessionIndex, 1);
		} else {

			// New session being added
			sessionInfo.created = firebase.firestore.Timestamp.fromDate(new Date());
			sessionInfo.recapOrder = [];
		}

		// Sort session in chronological order and add it to the session order array
		if(sessionOrder.length === 0 
			|| campaign.sessions[sessionOrder[sessionOrder.length - 1]].date.toDate() > sessionInfo.date.toDate()) {

			// Session is the first session chronologically
			sessionOrder.splice(sessionOrder.length, 0, sessionID);
		} else {
			for(let i = 0; i < sessionOrder.length; i++) {
				let session = campaign.sessions[sessionOrder[i]];
				
				if(session.date.toDate().getTime() <= sessionInfo.date.toDate().getTime()) {
					sessionOrder.splice(i, 0, sessionID);
					break;
				}
			}
		}

		let operation = this.props.edit ? "session-edit" : "session-add";

		// Add session in campaign document
		this.props.campaignRef.update({
			operation: operation,
			selectedSession: sessionID,
			['sessions.' + sessionID]: sessionInfo, 
			sessionOrder: sessionOrder,
		}).then(() => {
			console.log("Document successfully updated!");
			// Add session data locally
			campaign.sessions[sessionID] = sessionInfo;
			campaign.sessionOrder = sessionOrder;
			this.props.handleCampaign(campaign);

			if(!this.props.edit) {
				// Add session for recaps locally
				sessions[sessionID] = {recaps: {}};
				this.props.handleSessions(sessions);
				this.props.handleSelectedSession(sessionID);
			}
		}).catch((error) => {
			console.log("Error writing session:", error);
			this.props.handleError(error, "Could not save session");
		});
	}
	
	// Triggers when changing the date
	onChangeDate(date){		
    	this.setState({ date: date });
  	};

	// Triggers when changing the description
	onChangeDescription(event){		
    	this.setState({ 
			description: event.target.value,
			showAlert: false, 
		});
  	};

	render() {

		let title, submit;

		// Change texts based on whether editing or adding
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
					<Alert
						dismissible
						show={this.state.showAlert}
						onClose={() => this.setState({showAlert: false,})}
						variant="info"
					>
						A session with this description already exists!
					</Alert>
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
								maxLength="80" 
							/>
							<Form.Text className="text-muted">
								For example "Arrival to Phandalin".
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