import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal'
import { Form, Button } from 'react-bootstrap';

import { withFirebase } from '../Firebase/Firebase';

class NewCampaign extends Component {

	constructor(props) {
		super(props);	

		this.state = {
			name: "",
			world: "",
			setting: "",
			error: null,
		}
	}

	onSubmit = event => {
		this.props.onHide();

		event.preventDefault();

		let campaign = {
			name: this.state.name,
			world: this.state.world,
			setting: this.state.setting,
			sessionOrder: [],
			sessions: {},
			tags: {},
		};

		let campaigns = this.props.campaigns;		

		// Add to Firestore and then add locally
		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").add(campaign)
		.then((docRef) => {
			console.log("Document successfully written! DocRef: ", docRef);
			campaigns[docRef.id] = campaign;
			this.props.handleCampaigns(campaigns);
		})
		.catch(error => {
			console.error("Error writing document: ", error);
		});
	};
	  

	onChange = event => {
    	this.setState({ [event.target.name]: event.target.value });
  	};
	

	render() {

		const { campaigns, handleCampaigns, ...rest} = this.props;

		const { name, world, setting, error } = this.state;

		const isInvalid = name === '';

		return (
			<Modal
				{...rest}
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					Create a new campaign
				</Modal.Title>
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
								For example "Glorious Adventures in Middle Earth".
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
							Create new campaign!
						</Button>

						{error && <p>{error.message}</p>}
					</Form>
				</Modal.Body>
			</Modal>
		)
	}
}

export default withFirebase(NewCampaign);