import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal'
import { Form, Button } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase';

const INITIAL_STATE = {
    password: "",
	email: "",
    error: null,
};

/*
	Change Password component
*/
class ChangePassword extends Component {

	constructor(props) {
		super(props);

		this.state = {
            ...INITIAL_STATE,
			showAlert: false,
		}

		// Set the context for "this" for the following function
		this.onSubmit = this.onSubmit.bind(this);
		this.onChange = this.onChange.bind(this);
	}

    // Function called when submitting a new email
    onSubmit(event) {

        const { email } = this.state;

        // Change email in the auth profile on Firestore
        this.props.firebase.auth.currentUser.updateEmail(email)
        .then(() => {
            console.log("Email successfully updated!");
        }).catch((error) => {
			console.log("Error getting document:", error);
		});
        event.preventDefault();
    }

	// Triggers when changing values in the form
	onChange(event){		
    	this.setState({ 
			[event.target.name]: event.target.value,
			showAlert: false, 
		});
  	};

	render() {

		const { password, email, error } = this.state;
		const isInvalid = password === "" || email === "";

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
						Change Email
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={this.onSubmit}>
						<Form.Group 
                            controlId="formPasswordForEmailChange" 
                            className="account-current-password border-bottom"
                        >
							<Form.Label>Current Password</Form.Label>
							<Form.Control 
                                name="password"
                                value={password}
                                onChange={this.onChange}
                                type="password"
                                placeholder="Current Password"
                                maxLength="100"
                            />
						</Form.Group>
                        <Form.Group controlId="formNewEmail">
                            <Form.Label>New Email</Form.Label>
                            <Form.Control 
                                name="email"
                                value={email}
                                onChange={this.onChange}
                                type="text"
                                placeholder="New Email"
                                maxLength="100"
                            />
                        </Form.Group>
						<Button variant="success" type="submit" disabled={isInvalid}>
							Save New Email
						</Button>

                        <Alert
                            dismissible
                            show={this.state.showAlert}
                            onClose={() => this.setState({showAlert: false,})}
                            variant="danger"
                        >
                            {error && <div>{error.message}</div>}
                        </Alert>
					</Form>
				</Modal.Body>
			</Modal>
		)
	}
}

export default withFirebase(ChangePassword);