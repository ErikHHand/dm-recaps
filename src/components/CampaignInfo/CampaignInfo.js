import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal'
import { Form, Button } from 'react-bootstrap';

import { withFirebase } from '../Firebase/Firebase';

/*
	This component holds the pop-up window for editing campaign info,
	when adding or editing a campaign.
*/
class CampaignInfo extends Component {

	constructor(props) {
		super(props);	

		this.state = {
			description: "",
			name: "",
			world: "",
			setting: "",
			error: null,
		}

		// Set the context for "this" for the following functions
		//this.onSubmit = this.onSubmit.bind(this);
	}

	// Will be called when props change, which will update the state accordingly
	componentWillReceiveProps(newProps) {

		// Put the current information about the session in the state
		this.setState({
			name: newProps.campaign.name,
			description: newProps.campaign.description ? newProps.campaign.description : "",
			world: newProps.campaign.world,
			setting: newProps.campaign.setting
		});
	}

	// Triggers when info is submitted
	onSubmit = event => {

		// Hide the campaign info window
		this.props.onHide();
		event.preventDefault();

		if(!this.props.edit) {
			// Create campaign info
			let campaign = {
				description: this.state.description,
				name: this.state.name,
				world: this.state.world,
				setting: this.state.setting,
				sessionOrder: [],
				sessions: {},
				tags: {},
			};

			let campaigns = this.props.campaigns;		

			// Add to Firestore, which will generate an id, then add localy using the id
			this.props.campaignsRef.add(campaign)
			.then((docRef) => {
				console.log("Document successfully written! DocRef: ", docRef);

				// Add locally
				campaigns[docRef.id] = campaign;
				this.props.handleCampaigns(campaigns);
			})
			.catch(error => {
				console.error("Error writing document: ", error);
			});
		} else {
			// Edit campaign document on Firestore
			this.props.campaignsRef.doc(this.props.campaignID).update({
				description: this.state.description,
				name: this.state.name,
				world: this.state.world,
				setting: this.state.setting,
			}).then(function() {
				console.log("Document successfully updated!");
			}).catch(function(error) {
				console.log("Error getting document:", error);
			});

			// Edit locally
			let campaign = this.props.campaigns[this.props.campaignID];
			campaign["name"] = this.state.name;
			campaign["description"] = this.state.description;
			campaign["world"] = this.state.world;
			campaign["setting"] = this.state.setting;

			let campaigns = this.props.campaigns;
			campaigns[this.props.campaignID] = campaign;
			this.props.handleCampaigns(campaigns);
		}
	};
	  
	// Triggers when changing campaing info
	onChange = event => {
    	this.setState({ [event.target.name]: event.target.value });
  	};
	

	render() {

		const { description, name, world, setting, error } = this.state;
		const isInvalid = name === '';

		let title, submit;

		// Change texts based on whether editing or adding
		if(this.props.edit) {
			title = "Edit Campaign";
			submit = "Submit changes";
		} else {
			title = "Create a new campaign";
			submit = "Create campaign";
		}

		return (
			<Modal
				show={this.props.show}
				onHide={this.props.onHide}
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">{title}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<h4>Of to new adventures!</h4>
					<Form onSubmit={this.onSubmit}>
						<Form.Group controlId="formCampaignName">
							<Form.Label>Campaign Name</Form.Label>
							<Form.Control 
								name="name"
								value={name}
								onChange={this.onChange}
								type="text"
								placeholder="Campaign name..." 
							/>
							<Form.Text className="text-muted">
								For example "Glorious Adventures in Middle Earth". Or perhaps just the name of your character?
							</Form.Text>
						</Form.Group>

						<Form.Group controlId="formDescription">
							<Form.Label>Campaign Description</Form.Label>
							<Form.Control 
								name="description"
								value={description}
								onChange={this.onChange}
								as="textarea"
								type="text"
								placeholder="Campaign description..." 
							/>
							<Form.Text className="text-muted">
								A short description of the campaign. 
							</Form.Text>
						</Form.Group>

						<Form.Group controlId="formWorld">
							<Form.Label>World</Form.Label>
							<Form.Control 
								name="world"
								value={world}
								onChange={this.onChange}
								type="text"
								placeholder="World..."
							/>
							<Form.Text className="text-muted">
								For example "Middle Earth".
							</Form.Text>
						</Form.Group>

						<Form.Group controlId="formSetting">
							<Form.Label>Setting</Form.Label>
							<Form.Control 
								name="setting"
								value={setting}
								onChange={this.onChange}
								type="text"
								placeholder="Setting..."
							/>
							<Form.Text className="text-muted">
								For example "Fantasy".
							</Form.Text>
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

export default withFirebase(CampaignInfo);