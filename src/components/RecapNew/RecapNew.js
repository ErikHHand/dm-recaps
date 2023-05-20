import React, { Component } from 'react';

import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

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
			textAreaStyle: {height: "100%",}
		};

		// Set the context for "this" for the following functions
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
  	}

	componentDidMount() {
		// Automatically update the height of the text area to fit all text in it
		this.setState({textAreaStyle: {height: "max(" + this.textArea.scrollHeight + "px, 50px",}});
	}

	// Saves the recap text to the state while writing, and adjust height of the text area
	onChange(event) {
		this.setState({ 
			text: event.target.value,
			textAreaStyle: {height: "auto",},
		}, () =>
			this.setState({
				textAreaStyle: {height: "max(" + this.textArea.scrollHeight + "px, 50px",}
			})
		);
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
			textAreaStyle: {height: "50px",}
		});

		this.writeToRecaps(false, recap);
	};

	writeToRecaps(attempted, recap) {

		// Add to Firestore Recaps collection
		this.props.campaignRef.collection("recaps").add(recap)
		.then((recapRef) => {
			console.log("Recap successfully written!");
			this.writeToCampaign(false, recapRef.id, recap);
		}).catch((error) => {
			console.log("Error writing recap:", error);
			if(attempted) {
				this.props.handleError(error, "Could not save recap");
			} else {
				console.log("Reading and reattempting");
				this.props.loadCampaign(
					() => {this.writeToRecaps(true, recap)}
				);
			}
		});
	}

	writeToCampaign(attempted, recapID, recap) {

		let sessions = this.props.sessions;
		let sessionID = this.props.session;
		let session = sessions[sessionID];
		let campaign = this.props.campaign;
		let recapOrder = [...campaign.sessions[sessionID].recapOrder];
		recapOrder.push(recapID);

		// Add to Firestore recap order array
		this.props.campaignRef.update({
			operation: "recap-add",
			recapID: recapID,
			recapOrder: recapOrder,
			['sessions.' + sessionID + '.recapOrder']: firebase.firestore.FieldValue.arrayUnion(recapID),
			selectedSession: sessionID,
		}).then(() => {
			console.log("Recap order successfully updated!");

			// Add locally
			session.recaps[recapID] = recap;
			sessions[sessionID] = session;
			this.props.handleSessions(sessions);

			// Add locally to recap order array
			campaign.sessions[sessionID].recapOrder = recapOrder;
			this.props.handleCampaign(campaign);
			this.props.scrollToBottomOfRecaps();
		}).catch((error) => {
			console.log("Error updating recap order:", error);
			if(attempted) {
				console.log("Deleting recap from recaps collection");
				this.props.handleError(error, "Error occurred when trying to save recap");
				this.props.campaignRef.collection("recaps").doc(recapID).delete()
				.then(() => {
					console.log("Recap successfully deleted!");
				}).catch((error) => {
					console.log("ERROR DELETING RECAP:", error);
				});
			} else {
				console.log("Reading and reattempting");
				this.props.loadCampaign(
					() => {this.writeToCampaign(true, recapID, recap)}
				);
			}
		});
	}

	render() {

		const { text, error} = this.state;

		let recapNew = this;
		let noSessions = this.props.campaign.sessionOrder.length === 0;
		let noSessionSelected = !this.props.session;

		return (
			<Form onSubmit={this.onSubmit} ref={f => this.form = f}>
				<Form.Group controlId="formRecap" className="remove-margin">
					<Form.Control
						ref={textArea => this.textArea = textArea}
						name="text"
						value={text}
						onKeyDown={(event) => {
							if(event.key === "Enter") {
								event.preventDefault();
								recapNew.form.dispatchEvent(new Event('submit'))
							}}}
						onChange={this.onChange}
						disabled={noSessions || noSessionSelected}
						type="text"
						as="textarea"
						placeholder="Write something that happened..."
						className="regular-text"
						style={this.state.textAreaStyle}
						maxLength="4000" 
					/>
				</Form.Group>
				<Alert 
					show={noSessions || noSessionSelected} 
					variant="warning"
					className="alert-margin-top"
				>
					{noSessions ? "Create" : "Select"} a session before writing a recap!
				</Alert>
				{error && <p>{error.message}</p>}
			</Form>
		);
	}
}

export default withFirebase(RecapNew)