import React, { Component } from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

class NewRecap extends Component {
	constructor(props) {
		super(props);
	  
		this.state = {
			recap: "",
			error: "",
		};
  	}

	// Saves the recap text to the state while writing
	onChangeRecap(event, newRecap) {		
    	newRecap.setState({ 
			recap: event.target.value 
		});
	};
	
	// Triggers when submitting a recap
	onSubmitRecap = event => {
		event.preventDefault();

		// Recap data froms this state
		let recap = {
			tags: [],
			text: this.state.recap,
			session: this.props.currentSession,
		};

		this.setState({
			recap: "",
		});

		// Add locally to sessions
		let sessions = this.props.sessions;
		let session = sessions[this.props.currentSession];
		let id = recap.text.hashCode();

		session.recaps[id] = recap;

		sessions[this.props.currentSession] = session;
		this.props.handleSessions(sessions);
		
		// Add to Firestore Sessions
		
		this.props.campaignRef.collection("sessions").doc(this.props.currentSession)
		.update({
			['recaps.' + id]: recap,
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});

		// Add locally to recap order

		let campaign = this.props.campaign;
		campaign.sessions[this.props.currentSession].recapOrder.push(id);
		this.props.handleCampaign(campaign);

		// Add to Firestore Recap order
		
		this.props.campaignRef.update({
			['sessions.' + this.props.currentSession + '.recapOrder']: campaign.sessions[this.props.currentSession].recapOrder,
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});
	};

	render() {

		let newRecap = this;

		const { recap, error} = this.state;

		const isInvalid = recap === "" || !this.props.currentSession;

		return (
			<Form onSubmit={this.onSubmitRecap}>
				<Form.Group controlId="formRecap">
					<Form.Control 
						name="recap"
						value={recap}
						onChange={(event) => this.onChangeRecap(event, newRecap)}
						type="text"
						placeholder="Write something that happened..."
					/>
				</Form.Group>
				
				<Button variant="success" type="submit" disabled={isInvalid}>
					Submit
				</Button>
				<p hidden={this.props.currentSession}>Select a session before writing a recap!</p>
				{error && <p>{error.message}</p>}
			</Form>
		);
	}
}

export default withFirebase(NewRecap)