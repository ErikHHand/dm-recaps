import React, { Component } from 'react';

import FormSelectBadge from '../FormSelectBadge/FormSelectBadge';

import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Form, Button } from 'react-bootstrap';

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase';
/*
	This component holds the pop-up window for when creating a new session
	or editing an existing session.
*/
class TagInfo extends Component {

	constructor(props) {
		super(props);

		this.state = {
			name: "",
			description: "",
			type: "Location",
			colour: "red",
			error: "",
		}

		// Set the context for "this" for the following function
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.changeValue = this.changeValue.bind(this);
	}

	// Will be called when component mounts, and put necessary information in the state
	// if a tag is being edited
	componentDidMount() {
		if(this.props.edit) {
			this.setState({
				name: this.props.tag.name,
				type: this.props.tag.type,
				colour: this.props.tag.colour,
				description: this.props.tag.description ? this.props.tag.description : "",
			});
		}
	}

	// Will be called when an update happens to props. This is used to check
	// if a new tag is selected
	componentDidUpdate(prevProps) {

		// Update information in state based on the new tag selected
		if(this.props.tagID !== prevProps.tagID) {
			this.setState({
				name: this.props.tag.name,
				type: this.props.tag.type,
				colour: this.props.tag.colour,
				description: this.props.tag.description ? this.props.tag.description : "",
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

	// Triggers when submitting tag info after adding or editing a tag
	onSubmit(event) {

		event.preventDefault();
		// Hide the tag info window
		this.props.onHide();

		// The info to be saved with the tag
		let tagInfo = {
			name: this.state.name,
			type: this.state.type,
			colour: this.state.colour,
			description: this.state.description,
			created: firebase.firestore.Timestamp.fromDate(new Date()),
		};

		// If editing, only write to the tag field in the campaign object
		if(this.props.edit) {
			this.editTagInfo(this.props.tagID, tagInfo);
		} else {
			this.addNewTag(tagInfo);
		}
	}

	// Triggers when adding an entirely new tag
	// This function saves the tag locally and on Firestore
	addNewTag(tagInfo) {

		let tag = {
			recaps: {},
		}

		let tags = this.props.tags;
		let tagID = this.hashCode(tagInfo.name).toString(); 

		if(tags[tagID]) {
			this.props.handleSelectedTag(tagID);
			return;
		}

		// Add session locally
		tags[tagID] = tag;
		this.props.handleTags(tags);

		// Write tag info
		this.editTagInfo(tagID, tagInfo);
		this.props.handleSelectedTag(tagID);

		// Reset the state
		this.setState({
			name: "",
			type: "Location",
			colour: "red",
			description: "",
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
		if(this.props.selectTag) {
			this.props.handleSelectedTag(tagID);
		}
	}
	
	// Triggers when changing tag name or tag description
	onChange(event){
    	this.setState({ [event.target.name]: event.target.value });
  	};

	  // Triggers when changing tag type or tag colour
	changeValue(name, value) {
		this.setState({
			[name]: value,
		});
	}

	render() {

		let title, submit;

		// Change texts based on whether editing or adding
		if(this.props.edit) {
			title = "Edit Tag";
			submit = "Submit changes";
		} else {
			title = "Create a new tag";
			submit = "Create new tag";
		}

		const { name, type, colour, description, error } = this.state;
		const isInvalid = name === "" || description === "";

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
								maxLength="80" 
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
								maxLength="1000" 
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