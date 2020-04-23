import React, { Component } from 'react';

import FormSelectBadge from '../FormSelectBadge/FormSelectBadge';

import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Form, Button } from 'react-bootstrap';

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This component holds the pop-up for editing and adding tags
*/
class TagInfo extends Component {

	constructor(props) {
		super(props);

		this.state = {
			error: "",
		}

		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.changeValue = this.changeValue.bind(this);
	}

	// Will be called when props change, which will update state accordingly
	componentWillReceiveProps(newProps) {

		// Put the current information about the tag in the state
		this.setState({
			name: newProps.tag.name,
			type: newProps.tag.type,
			colour: newProps.tag.colour,
			description: newProps.tag.description ? newProps.tag.description : "",
		});
	}

	// Triggers when submitting tag info
	onSubmit(event) {

		// Hide the tag info window
		this.props.onHide();
		event.preventDefault();

		// The info to be saved with the tag
		let tagInfo = {
			name: this.state.name,
			type: this.state.type,
			colour: this.state.colour,
			description: this.state.description,
			created: firebase.firestore.Timestamp.fromDate(new Date()),
		};

		// If editing, only writing to the tag field in the campaign object
		// is neccessary and a new tag is not needed
		if(this.props.edit) {
			this.editTagInfo(this.props.tagID, tagInfo);
		} else {
			this.addNewTag(tagInfo);
		}
	}

	// Triggers when adding an entirely new tag, as opposed to editing an existing one.
	// This function saves the tag locally and on Firestore
	addNewTag(tagInfo) {

		let tag = {
			recaps: {},
		}

		// First add to Firestore then add locally, because adding to Firestore 
		// will generate the id needed to store locally
		this.props.campaignRef.collection("tags").add(tag)
		.then((docRef) => {
			console.log("Document successfully written! DocRef: ", docRef);

			// Add tag locally
			let tags = this.props.tags;
			tags[docRef.id] = tag;
			this.props.handleTags(tags);

			// Write tag info
			this.editTagInfo(docRef.id, tagInfo);
		})
		.catch(error => {
			console.error("Error writing document: ", error);
		});
	};

	// Triggers when editing a tag or just after a new tag has been added.
	// This function saves the tag info locally and on Firestore
	editTagInfo(tagID, tagInfo) {

		// Add tag in campaign document
		this.props.campaignRef.update({
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
	
	// Triggers when changing tag info
	onChange(event){
    	this.setState({ [event.target.name]: event.target.value });
  	};

	changeValue(name, value) {
		this.setState({
			[name]: value,
		});
	}

	render() {

		let title, submit;

		if(this.props.edit) {
			title = "Edit Tag";
			submit = "Submit changes";
		} else {
			title = "Create a new tag";
			submit = "Create new tag";
		}

		const { name, type, colour, description, error } = this.state;
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

						<Form.Group controlId="formDescription">
							<Form.Label>Description</Form.Label>
							<Form.Control 
								name="description"
								value={description}
								onChange={this.onChange}
								type="text"
								as="textarea"
								placeholder="Description...."
							/>
							<Form.Text className="text-muted">
								For example "Misty Mountains".
							</Form.Text>
						</Form.Group>
						<Row className="select-row">
							<Col>
								<FormSelectBadge
									name = "type"
									value = {type}
									changeValue = {(name, value) => this.changeValue(name, value)}
								/>
							</Col>
							<Col>
								<FormSelectBadge
									name = "colour"
									value = {colour}
									changeValue = {(name, value) => this.changeValue(name, value)}
								/>
							</Col>
						</Row>
						<div>
							<Button variant="success" type="submit" disabled={isInvalid} >
								{submit}
							</Button>
						</div>
						{error && <p>{error.message}</p>}
					</Form>
				</Modal.Body>
			</Modal>
		)
	}
}

export default withFirebase(TagInfo);