import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal'
import { Form, Button } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase';

const INITIAL_STATE = {
    password: "",
	username: "",
    error: null,
};

/*
	Delete account component
*/
class DeleteAccount extends Component {

	constructor(props) {
		super(props);

		this.state = {
            ...INITIAL_STATE,
			showAlert: false,
            readOnlyPassword: true,
		}

		// Set the context for "this" for the following function
		this.onSubmit = this.onSubmit.bind(this);
		this.onChange = this.onChange.bind(this);
	}

    // Function called when submitting a new username
    onSubmit(event) {

        event.preventDefault();

        const user = this.props.firebase.auth.currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email, 
            this.state.password,
        );

        // Reauthenticate user
        user.reauthenticateWithCredential(credential)
        .then((authUser) => {

            // Delete account
            // This currently does not delete campaigns owned by the user

            // Delete username document from usernames collection
            this.props.firebase.db.collection("usernames").doc(authUser.user.displayName).delete()
            .then(() => {
                console.log("Document successfully deleted!");

                // Delete user document from users collection
                this.props.firebase.db.collection("users").doc(authUser.user.uid).delete()
                .then(() => {
                    console.log("Document successfully deleted!");
                    authUser.user.delete();
                }).catch((error) => {
                    console.log("Error deleting document:", error);
                });
            }).catch((error) => {
                console.log("Error deleting document:", error);
            });
        }).catch(error => {
            console.log("Reauthentication failed");
            this.setState({ 
                error: error,
                showAlert: true,
            });
        });
    }

	// Triggers when changing values in the form
	onChange(event){		
    	this.setState({ 
			[event.target.name]: event.target.value,
			showAlert: false, 
		});
  	};

	render() {

        let currentUsername = this.props.firebase.auth.currentUser.displayName ? 
            this.props.firebase.auth.currentUser.displayName : "username";

        const { password, username, error } = this.state;
        const isInvalid = password === "" || username !== currentUsername;

		return (
			<Modal
				show={this.props.show}
				onHide={this.props.onHide}
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
                className="dark-background"
			>
				<Modal.Header closeButton className="delete-account">
					<Modal.Title id="contained-modal-title-vcenter">
						Delete account
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={this.onSubmit} autoComplete="off">
                        <input style={{display: "none"}} type="text" name="googlechromeautofillSUCKS" />
						<Form.Group 
                            controlId="formPasswordForAccountDeletion" 
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
                                autoComplete="new-password"
                            />
						</Form.Group>
                        <Form.Group className="mb-3" controlId="formNewUsername">
                            <Form.Label>
                                To confirm that you want to delete your account, type your username: {currentUsername}
                            </Form.Label>
                            <Form.Control 
                                name="username"
                                value={username}
                                onChange={this.onChange}
                                type="text"
                                placeholder="Type your username"
                                maxLength="100"
                            />
                        </Form.Group>
						<Button variant="danger" type="submit" disabled={isInvalid}>
							Delete Account
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

export default withFirebase(DeleteAccount);