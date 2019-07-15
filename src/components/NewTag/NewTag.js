import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal'
import { Form, Button } from 'react-bootstrap';

import { withFirebase } from '../Firebase/Firebase';

class NewSession extends Component {

	constructor(props) {
		super(props);

		this.state = {
			name: "",
			type: "Location",
			colour: "#415b39",
			error: "",
		}
	}

	onSubmit = event => {
		this.props.onHide();

		event.preventDefault();

		let tag = {
			recaps: {},
		}

		let tagInfo = {
			name: this.state.name,
			type: this.state.type,
			colour: this.state.colour,
			created: new Date(),
		};
		
		// Add to Firestore and then add locally

		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).collection("tags").add(tag)
		.then((docRef) => {
			console.log("Document successfully written! DocRef: ", docRef);

			// Add tag in campaign document

			this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
			.collection("campaigns").doc(this.props.id).update({
				['tags.' + docRef.id]: tagInfo,
			}).then(function() {
			console.log("Document successfully updated!");
			}).catch(function(error) {
				console.log("Error getting document:", error);
			});

			// Add tag locally
			let tags = this.props.tags;
			tags[docRef.id] = tag;
			this.props.handleTags(tags);

			let campaign = this.props.campaign;
			campaign.tags[docRef.id] = tagInfo;
			this.props.handleCampaign(campaign);
		})
		.catch(error => {
			console.error("Error writing document: ", error);
		});
	};
	
	onChange = event => {
    	this.setState({ [event.target.name]: event.target.value });
  	};
	

	render() {

		const { campaign, handleCampaign, tags, handleTags, ...rest} = this.props;

		const { name, type, colour, error } = this.state;

		const isInvalid = name === "";

		return (
			<Modal
				{...rest}
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					Create a new tag
				</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={this.onSubmit}>
						<Form.Group controlId="formName">
							<Form.Label>Name</Form.Label>
							<Form.Control 
								name="name"
								value={name}
								onChange={this.onChange}
								type="text"
								placeholder="Name...."
							/>
							<Form.Text className="text-muted">
								For example "Misty Mountains".
							</Form.Text>
						</Form.Group>

						<Form.Group controlId="formType">
							<Form.Label>Type</Form.Label>
							<Form.Control 
								name="type"
								value={type}
								onChange={this.onChange}
								as="select"
							>
								<option>Location</option>
								<option>NPC</option>
								<option>Player</option>
								<option>Quest</option>
								<option>Item</option>
							</Form.Control>
						</Form.Group>

						<Form.Group controlId="formColour">
							<Form.Label>Colour</Form.Label>
							<Form.Control 
								name="colour"
								value={colour}
								onChange={this.onChange}
								as="select"
								placeholder="Type..."
							>
								<option>#415b39</option>
								<option>#66d7d1</option>
								<option>#403d58</option>
								<option>#ea5864</option>
								<option>#f0f757</option>
							</Form.Control>
						</Form.Group>
						
						<Button variant="success" type="submit" disabled={isInvalid}>
							Create new tag
						</Button>

						{error && <p>{error.message}</p>}
					</Form>
				</Modal.Body>
			</Modal>
		)
	}
}

export default withFirebase(NewSession);