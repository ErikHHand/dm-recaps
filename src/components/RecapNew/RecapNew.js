import React, { Component } from 'react';

import Form from 'react-bootstrap/Form'

import { withFirebase } from '../Firebase/Firebase';

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
		let id = this.hashCode(recap.text).toString(); // TODO: Check for hashcode collisions
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

		// TEMPORARY LOOP - REMOVE AFTER A WHILE - IS HERE TO BUGFIX TYPE ERROR
		for(let session in campaign.sessions) {
			for(let i = 0; i < campaign.sessions[session].recapOrder.length; i++) {
				let recapID = campaign.sessions[session].recapOrder[i];
				if(!isNaN(recapID)) {
					campaign.sessions[session].recapOrder[i] = recapID.toString();
				}
			}
		}
		
		campaign.sessions[this.props.session].recapOrder.push(id);
		this.props.handleCampaign(campaign);

		// TEMPORARY LOOP - REMOVE AFTER A WHILE - IS HERE TO BUGFIX TYPE ERROR
		for(let session in campaign.sessions) {
			// Add to Firestore recap order array
			this.props.campaignRef.update({
				['sessions.' + session + '.recapOrder']: campaign.sessions[session].recapOrder,
			})
			.then(function() {
				console.log("Document successfully updated!");
			}).catch(function(error) {
				console.log("Error getting document:", error);
			});
		}
	};

	render() {

		const { text, error} = this.state;

		let recapNew = this;

		return (
			<Form onSubmit={this.onSubmit} ref={f => this.form = f}>
				<Form.Group controlId="formRecap" className="remove-margin">
					<Form.Control 
						name="text"
						value={text}
						onKeyDown={(event) => {
							if(event.keyCode === 13) {
								event.preventDefault();
								recapNew.form.dispatchEvent(new Event('submit'))
							}}}
						onChange={this.onChange}
						disabled={!this.props.session}
						type="text"
						as="textarea"
						placeholder="Write something that happened..."
						className="regular-text"
						maxLength="4000" 
					/>
				</Form.Group>
				<p hidden={this.props.session}>Select a session before writing a recap!</p>
				{error && <p>{error.message}</p>}
			</Form>
		);
	}
}

export default withFirebase(RecapNew)