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
	Change Password component
*/
class ChangeUsername extends Component {

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

    // Function called when submitting a new username
    onSubmit(event) {

        const { username } = this.state;

        let usernameRef = this.props.firebase.db.collection("usernames").doc(username);

        // First check is the submitted username is already taken.
        usernameRef.get().then((usernameDoc) => {
            if(!usernameDoc.exists) {

                // Username is not taken

                let oldUsername = this.props.firebase.auth.currentUser.displayName;

                // Change username in the users collection on Firestore
                this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
                .update({
                    username: username,
                }).then(() => {
                    console.log("Document successfully updated!");
                }).catch((error) => {
                    console.log("Error updating document:", error);
                });
                
                // Change displayName property in the auth profile on Firestore
                this.props.firebase.auth.currentUser.updateProfile({
                    displayName: username,
                }).then(() => {
                    console.log("Document successfully updated!");
                    this.setState({ ...INITIAL_STATE });
                }).catch((error) => {
                    console.log("Error updating displayName:", error);
                });

                // Delete old username document from usernames collection
                this.props.firebase.db.collection("usernames").doc(oldUsername).delete()
                .then(() => {
                    console.log("Document successfully deleted!");
                }).catch((error) => {
                    console.log("Error deleting document:", error);
                });

                // Write new username document in usernames collection
                this.props.firebase.db.collection("usernames").doc(username).set({
                    uid: this.props.firebase.auth.currentUser.uid,
                }).then(
                    console.log("Document written with ID: ", username)
                ).catch((error) => {
                    console.error("Error adding document: ", error);
                });
            } else {
                // Username is taken
                this.setState({ 
                    error: {message: "Username is not available. Please choose a different username."}, 
                });
            }
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

		const { password, username, error } = this.state;
		const isInvalid = password === "" || username === "";

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
						Change Username
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={this.onSubmit}>
						<Form.Group 
                            controlId="formPasswordForUsernameChange" 
                            className="account-current-password border-bottom"
                        >
							<Form.Label>Current Password</Form.Label>
							<Form.Control 
                                name="passwordForUsernameChange"
                                value={password}
                                onChange={this.onChange}
                                type="password"
                                placeholder="Current Password"
                                maxLength="100"
                            />
						</Form.Group>
                        <Form.Group controlId="formNewUsername">
                            <Form.Label>New Username</Form.Label>
                            <Form.Control 
                                name="username"
                                value={username}
                                onChange={this.onChange}
                                type="text"
                                placeholder="New Username"
                                maxLength="100"
                            />
                        </Form.Group>
						<Button variant="success" type="submit" disabled={isInvalid}>
							Save New Username
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

export default withFirebase(ChangeUsername);