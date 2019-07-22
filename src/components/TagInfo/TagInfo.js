import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal'
import { Form, Button } from 'react-bootstrap';

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

class TagInfo extends Component {

	constructor(props) {
		super(props);

		this.state = {
			name: "",
			type: "Location",
			colour: "#415b39",
			error: "",
		}
	}

	componentDidMount() {

		if(this.props.edit) {
			this.setState({
				name: this.props.tag.name,
				type: this.props.tag.type,
				colour: this.props.tag.colour,
			});
		}
	}

	onSubmit = event => {

		this.props.onHide();
		event.preventDefault();

		if(this.props.edit) {
			this.editTagInfo(this.props.tagID);
		} else {
			this.addNewTag();
		}
	}

	addNewTag() {

		let tag = {
			recaps: {},
		}

		// Add to Firestore and then add locally

		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).collection("tags").add(tag)
		.then((docRef) => {
			console.log("Document successfully written! DocRef: ", docRef);

			// Add tag locally
			let tags = this.props.tags;
			tags[docRef.id] = tag;
			this.props.handleTags(tags);

			this.editTagInfo(docRef.id);
		})
		.catch(error => {
			console.error("Error writing document: ", error);
		});
	};

	editTagInfo(tagID) {

		// Add tag in campaign document

		let tagInfo = {
			name: this.state.name,
			type: this.state.type,
			colour: this.state.colour,
			created: firebase.firestore.Timestamp.fromDate(new Date()),
		};

		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).update({
			['tags.' + tagID]: tagInfo,
		}).then(function() {
		console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});

		let campaign = this.props.campaign;
		campaign.tags[tagID] = tagInfo;
		this.props.handleCampaign(campaign);
	}
	
	onChange = event => {
    	this.setState({ [event.target.name]: event.target.value });
  	};
	

	render() {

		let title, submit;

		if(this.props.edit) {
			title = "Edit Tag";
			submit = "Submit changes";
		} else {
			title = "Create a new tag";
			submit = "Create new tag";
		}
		const { name, type, colour, error } = this.state;

		const isInvalid = name === "";

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
							{submit}
						</Button>

						{error && <p>{error.message}</p>}
					</Form>
				</Modal.Body>
			</Modal>
		)
	}
}

export default withFirebase(TagInfo);