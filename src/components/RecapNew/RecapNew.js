import React, { Component } from 'react';

import Form from 'react-bootstrap/Form'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This class holds the field where new recaps are entered and
	handles adding new recaps.
*/
class RecapNew extends Component {
	constructor(props) {
		super(props);
	  
		this.state = {
			text: "",
			error: "",
		};

		// Set the context for "this" for the following functions
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
  	}

	// Saves the recap text to the state while writing
	onChange(event) {
		this.setState({ text: event.target.value });
	}

	// Triggers when submitting a recap
	onSubmit(event) {
		event.preventDefault();

		// Recap data from this state
		let recap = {
			tags: [],
			text: this.state.text,
			session: this.props.session,
		};

		// Empty the form field
		this.setState({
			text: "",
		});

		// Generate a hash code from the recap text
		// and then add locally
		let sessions = this.props.sessions;
		let session = sessions[this.props.session];
		
		// TODO: Check for hashcode collisions
		let id = recap.text.hashCode();
		session.recaps[id] = recap;

		sessions[this.props.session] = session;
		this.props.handleSessions(sessions);
		
		// Add to Firestore Sessions
		this.props.campaignRef.collection("sessions").doc(this.props.session)
		.update({
			['recaps.' + id]: recap,
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});

		// Add locally to recap order array
		let campaign = this.props.campaign;
		campaign.sessions[this.props.session].recapOrder.push(id);
		this.props.handleCampaign(campaign);

		// Add to Firestore recap order array
		this.props.campaignRef.update({
			['sessions.' + this.props.session + '.recapOrder']: campaign.sessions[this.props.session].recapOrder,
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});
	};

	render() {

		const { text, error} = this.state;

		let recapNew = this;

		return (
			<Form onSubmit={this.onSubmit} ref={f => this.form = f}>
				<Form.Group controlId="formRecap">
					<Form.Control 
						name="text"
						value={text}
						onKeyDown={(event) => {if(event.keyCode === 13) recapNew.form.dispatchEvent(new Event('submit'))}}
						onChange={this.onChange}
						disabled={!this.props.session}
						type="text"
						as="textarea"
						placeholder="Write something that happened..."
					/>
				</Form.Group>
				<p hidden={this.props.session}>Select a session before writing a recap!</p>
				{error && <p>{error.message}</p>}
			</Form>
		);
	}
}

export default withFirebase(RecapNew)