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

        event.preventDefault();
        let changeUsername = this;

        const { username, password } = this.state;

        const user = this.props.firebase.auth.currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email, 
            password,
        );

        // Reauthenticate user
        user.reauthenticateWithCredential(credential)
        .then((authUser) => {

            let usernameRef = this.props.firebase.db.collection("usernames").doc(username);

            // First check if the submitted username is already taken.
            usernameRef.get().then((usernameDoc) => {
                if(!usernameDoc.exists) {

                    // Username is not taken

                    // Update locally
                    let user = this.props.user;
                    user.username = username;
                    this.props.handleUser(user);

                    let oldUsername = this.props.firebase.auth.currentUser.displayName;

                    // Change username in the users collection on Firestore
                    this.props.firebase.db.collection("users").doc(authUser.user.uid)
                    .update({
                        username: username,
                        usernameLastChanged: firebase.firestore.Timestamp.fromDate(new Date()),
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

                    // Write username in owned campaigns
                    let campaignsRef = this.props.firebase.db.collection("campaigns");
                    if(this.props.ownedCampaigns) {
                        for(let i = 0; i < this.props.ownedCampaigns.length; i++) {
                            campaignsRef.doc(this.props.ownedCampaigns[i])
                            .update({
                                operation: "owner-username-update",
                                ownerUsername: username,
                            }).then(() => {
                                console.log("Document successfully updated!");
                            }).catch((error) => {
                                console.log("Error updating document:", error);
                            });
                        }
                    }
                    
                    // Write username in campaigns shared with user
                    campaignsRef.where("usersSharedWithList", "array-contains", authUser.user.uid)
                    .where("sharingIsOn", "==", true).get().then((sharedWithCampaigns) => {

                        sharedWithCampaigns.forEach((doc) => {
                            console.log(doc.id)
                            campaignsRef.doc(doc.id).update({
                                operation: "shared-username-update",
                                ["usersSharedWith." + authUser.user.uid]: username
                            })
                            .then(() => {
                                console.log("Document successfully updated!");
                            }).catch((error) => {
                                console.log("Error updating document:", error);
                            });
                        });
                    }).catch((error) => {
                        console.log("Error updating document:", error);
                    });
                    changeUsername.props.onHide();
        
                } else {
                    // Username is taken
                    this.setState({ 
                        error: {message: "Username is not available. Please choose a different username."}, 
                    });
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
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
					<Form onSubmit={this.onSubmit} autoComplete="off">
                        <input style={{display: "none"}} type="text" name="googlechromeautofillSUCKS" />
						<Form.Group 
                            controlId="formPasswordForUsernameChange" 
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
                        <Form.Group controlId="formNewUsername">
                            <Form.Label>New Username</Form.Label>
                            <Form.Control 
                                name="username"
                                value={username}
                                onChange={this.onChange}
                                type="delete"
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