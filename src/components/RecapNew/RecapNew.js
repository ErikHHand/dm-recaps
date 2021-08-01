import React, { Component } from 'react';

import Form from 'react-bootstrap/Form'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase';

/*
	This class holds the text field where new recaps are entered and
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
		
		// Add to Firestore Recaps collection
		this.props.campaignRef.collection("recaps").add(recap)
		.then((recapRef) => {

			// Add locally
			let sessions = this.props.sessions;
			let sessionID = this.props.session;
			let session = sessions[sessionID];			

			session.recaps[recapRef.id] = recap;
			sessions[sessionID] = session;
			this.props.handleSessions(sessions);

			// Add locally to recap order array
			let campaign = this.props.campaign;

			campaign.sessions[sessionID].recapOrder.push(recapRef.id);

			// Create recaps array
			let recaps = [];

			for (let session in campaign.sessions) {
				recaps = recaps.concat(campaign.sessions[session].recapOrder)
			}

			campaign.recaps = recaps;
			this.props.handleCampaign(campaign);

			// Add to Firestore recap order array
			this.props.campaignRef.update({
				['sessions.' + sessionID + '.recapOrder']: firebase.firestore.FieldValue.arrayUnion(recapRef.id),
				selectedSession: sessionID,
				recaps: recaps,
			})
			.then(() => {
				console.log("Document successfully updated!");
			}).catch((error) => {
				console.log("Error getting document:", error);
			});
			console.log("Document successfully updated!");
		}).catch((error) => {
			console.log("Error getting document:", error);
		});
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