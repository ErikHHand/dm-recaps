import React, { Component } from 'react';

import FormSelectBadge from '../FormSelectBadge/FormSelectBadge';

import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Form, Button } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase';
/*
	This component holds the pop-up window for when creating a new tag
	or editing an existing tag.
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
			showAlert: false,
		}

		// Set the context for "this" for the following function
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.changeValue = this.changeValue.bind(this);
	}

	// If a tag is being edited, the data from the tag will be put in the state and become
	// visible in the form fields
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
	// Used to create ID:s for the Tag items
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

		// The data to be saved with the tag
		let tagInfo = {
			name: this.state.name,
			type: this.state.type,
			colour: this.state.colour,
			description: this.state.description,
			created: firebase.firestore.Timestamp.fromDate(new Date()),
		};

		if(this.props.edit) {
			this.editTagInfo(this.props.tagID, tagInfo);
		} else {
			this.addNewTag(tagInfo);
		}
	}

	// Triggers when adding an entirely new tag
	// This function generates a new tag ID and
	// saves the tag locally and on Firestore
	addNewTag(tagInfo) {

		let tag = {
			recaps: {},
		}

		let tags = this.props.tags;
		let tagID = this.hashCode(tagInfo.name).toString(); 

		// Check if a tag with this name already exists. If so,
		// Show an alert insetad of creating a new tag
		if(tags[tagID]) {
			this.setState({showAlert: true,})
			return;
		}

		// Add tag locally
		tags[tagID] = tag;
		this.props.handleTags(tags);

		// Write tag info
		this.editTagInfo(tagID, tagInfo);

		// Reset the state
		this.setState({
			name: "",
			type: "Location",
			colour: "red",
			description: "",
		});

		// If this tag is being added from the tag selector pop-up, 
		// the tag should not be selected
		if(this.props.doNotSelectTag) {
			return;
		}
		this.props.handleSelectedTag(tagID);
	};

	// Triggers when editing a tag or just after a new tag has been added.
	// This function saves the tag data locally and on Firestore
	editTagInfo(tagID, tagInfo) {

		// Hide the tag info window
		this.props.onHide();

		let operation = this.props.edit ? "tag-edit" : "tag-add";

		// Add tag in campaign document
		this.props.campaignRef.update({
			operation: operation,
			selectedTag: tagID,
			['tags.' + tagID]: tagInfo,
		}).then(() => {
			console.log("Document successfully updated!");
		}).catch((error) => {
			console.log("Error getting document:", error);
		});

		let campaign = this.props.campaign;
		campaign.tags[tagID] = tagInfo;
		this.props.handleCampaign(campaign);
	}
	
	// Triggers when changing tag name or tag description
	onChange(event){
    	this.setState({ [
			event.target.name]: event.target.value,
			showAlert: false,
		});
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
					<Alert
						dismissible
						show={this.state.showAlert}
						onClose={() => this.setState({showAlert: false,})}
						variant="info"
					>
						A tag with this name already exists!
					</Alert>
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