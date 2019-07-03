import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal'
import { Form, Button } from 'react-bootstrap';

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

		// TODO
		// Add the new campaign to Firestore and locally

		event.preventDefault();
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

export default NewCampaign;