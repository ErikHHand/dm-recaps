import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal'
import { Form, Button } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase';

const INITIAL_STATE = {
    currentPassword: "",
	passwordOne: "",
    passwordTwo: "",
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

    // Function called when submitting a new password
    onSubmit(event) {
        const { passwordOne } = this.state;
     
        // Write new password to backend, then reset the state
        this.props.firebase.doPasswordUpdate(passwordOne)
            .then(() => {
                this.setState({ ...INITIAL_STATE });
            }).catch(error => {
                this.setState({ 
                    error: error,
                    showAlert: true,
                });
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

		const { currentPassword, passwordOne, passwordTwo, error } = this.state;
		const isInvalid = currentPassword === "" || passwordOne === "" || passwordOne !== passwordTwo;

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
						Change password
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={this.onSubmit} autoComplete="off">
						<Form.Group 
                            controlId="formCurrentPassword" 
                            className="account-current-password border-bottom"
                        >
							<Form.Label>Current Password</Form.Label>
							<Form.Control 
                                name="currentPassword"
                                value={currentPassword}
                                onChange={this.onChange}
                                type="password"
                                placeholder="Current Password"
                                maxLength="100"
                                autoComplete="new-password"
                            />
						</Form.Group>

                        <Row>
                            <Col md>
                                <Form.Group controlId="formPasswordOne">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control 
                                        name="passwordOne"
                                        value={passwordOne}
                                        onChange={this.onChange}
                                        type="password"
                                        placeholder="New Password"
                                        maxLength="100"
                                        autoComplete="new-password"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md>
                                <Form.Group controlId="formPasswordTwo">
                                    <Form.Label>Repeat new password</Form.Label>
                                    <Form.Control 
                                        name="passwordTwo"
                                        value={passwordTwo}
                                        onChange={this.onChange}
                                        type="password"
                                        placeholder="Repeat Password"
                                        maxLength="100"
                                        autoComplete="new-password"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
						<Button variant="success" type="submit" disabled={isInvalid}>
							Save New Password
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