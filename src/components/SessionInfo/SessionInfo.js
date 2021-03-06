import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal'
import { Form, Button } from 'react-bootstrap';
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

		// Hide the session info window
		this.props.onHide();
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

		let session = {
			recaps: {},
		};

		let sessions = this.props.sessions;
		let sessionID = this.hashCode(sessionInfo.description).toString(); // TODO: Check for hashcode collisions

		if(sessions[sessionID]) {
			this.props.handleSelectedSession(sessionID);
			return;
		}

		// Add session locally
		sessions[sessionID] = session;
		this.props.handleSessions(sessions);

		// Write session info
		this.editSessionInfo(sessionID, sessionInfo);

		this.props.handleSelectedSession(sessionID);
	};

	// Triggers when editing a session or just after a new session has been added.
	// This function saves the session info locally and on Firestore
	editSessionInfo(sessionID, sessionInfo) {

		let campaign = this.props.campaign;

		// Write data depending on whether or not this a new 
		// session or an old session being edited
		if(campaign.sessions[sessionID]) { // Session being edited

			sessionInfo.created = campaign.sessions[sessionID].created;
			sessionInfo.recapOrder = campaign.sessions[sessionID].recapOrder;

			// Remove the session from the session order array
			let sessionIndex = campaign.sessionOrder.indexOf(sessionID);
			if (sessionIndex !== -1) campaign.sessionOrder.splice(sessionIndex, 1);
		} else { // New session being added

			sessionInfo.created = firebase.firestore.Timestamp.fromDate(new Date());
			sessionInfo.recapOrder = [];
		}

		// Sort session in chronological order and add it to the session order array
		if(campaign.sessionOrder.length === 0 
			|| campaign.sessions[campaign.sessionOrder[campaign.sessionOrder.length - 1]].date.toDate() > sessionInfo.date.toDate()) {

			// Session is the first session chronologically
			campaign.sessionOrder.splice(campaign.sessionOrder.length, 0, sessionID);
		} else {
			for(let i = 0; i < campaign.sessionOrder.length; i++) {
				let session = campaign.sessions[campaign.sessionOrder[i]];
				
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
			['sessions.' + sessionID]: sessionInfo, sessionOrder: campaign.sessionOrder,
		}).then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});
	}
	
	// Triggers when changing the date
	onChangeDate(date){		
    	this.setState({ date: date });
  	};

	// Triggers when changing the description
	onChangeDescription(event){		
    	this.setState({ description: event.target.value });
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