import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal'
import { Form, Button } from 'react-bootstrap';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase';


class NewSession extends Component {

	constructor(props) {
		super(props);

		this.state = {
			date: new Date(),
			description: "",
			error: null,
		}
	}

	onSubmit = event => {
		this.props.onHide();

		event.preventDefault();

		let session = {
			recaps: {},
			recapCounter: 0
		};

		let sessionInfo = {
			date: firebase.firestore.Timestamp.fromDate(this.state.date),
			description: this.state.description,
		}
		
		// Add to Firestore and then add locally
		
		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).collection("sessions").add(session)
		.then((docRef) => {
			console.log("Document successfully written! DocRef: ", docRef);

			// Add session in campaign document

			this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
			.collection("campaigns").doc(this.props.id).update({
				['sessions.' + docRef.id]: sessionInfo,
			}).then(function() {
			console.log("Document successfully updated!");
			}).catch(function(error) {
				console.log("Error getting document:", error);
			});

			// Add session locally

			let sessions = this.props.sessions;
			sessions[docRef.id] = session;
			this.props.handleSessions(sessions);

			let campaign = this.props.campaign;
			campaign.sessions[docRef.id] = sessionInfo;
			this.props.handleCampaign(campaign);
		})
		.catch(error => {
			console.error("Error writing document: ", error);
		});
	};
	
	onChangeDate = date => {		
    	this.setState({ date: date });
  	};

	onChangeDescription = event => {		
    	this.setState({ description: event.target.value });
  	};
	

	render() {

		const { sessions, handleSessions, campaign, handleCampaign, ...rest} = this.props;

		const { date, description, error } = this.state;

		const isInvalid = date === "" || description === "";

		return (
			<Modal
				{...rest}
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					Add a new session
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
							Add new session
						</Button>

						{error && <p>{error.message}</p>}
					</Form>
				</Modal.Body>
			</Modal>
		)
	}
}

export default withFirebase(NewSession);