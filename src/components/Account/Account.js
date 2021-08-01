import React, { Component } from 'react';

import { withFirebase } from '../Firebase/Firebase';
import { withAuthorization } from '../Session/Session';

import Navbar from '../Navbar/Navbar';

import { Form, Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container'

// Empty state used for resetting feilds when data from a field is submited
const INITIAL_STATE = {
    email: '',
    username: '',
    passwordOne: '',
    passwordTwo: '',
    error: null,
};

/*
    This class hold the account page of the app. This is where a user can update 
    account details. 
*/
class Account extends Component {
    constructor(props) {
        super(props);
     
        this.state = { ...INITIAL_STATE };

        // Set the context for "this" for the following functions
		this.onChange = this.onChange.bind(this);
		this.onChangePassword = this.onChangePassword.bind(this);
		this.onChangeUsername = this.onChangeUsername.bind(this);
		this.onChangeEmail = this.onChangeEmail.bind(this);
    }

    // Function called when submitting a new password
    onChangePassword(event) {
        const { passwordOne } = this.state;
     
        // Write new password to backend, then reset the state
        this.props.firebase.doPasswordUpdate(passwordOne)
            .then(() => {
                this.setState({ ...INITIAL_STATE });
            })
            .catch(error => {
                this.setState({ error });
            });
     
        event.preventDefault();
    }

    // Function called when submitting a new username
    onChangeUsername(event) {

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

    // Function called when submitting a new email
    onChangeEmail(event) {

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

    // Triggers when writing in a field on the account page
    onChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    render() {

        const { passwordOne, passwordTwo, username, email, error } = this.state;
     
        const isPasswordInvalid = passwordOne !== passwordTwo || passwordOne === '';
        const isUsernameInvalid = username === '';
        const isEmailInvalid = email === '';

        // Checks if displayName is set for profile, and also handles if currentUser is null
        let displayNameTitle = this.props.firebase.auth.currentUser.displayName ? 
            this.props.firebase.auth.currentUser.displayName + "'s Account" : "Account";

        return (
            <Container>
                <Navbar/>
                <h1 className="border-bottom">{displayNameTitle}</h1>
                <h4>Change Password</h4>
                <Form onSubmit={this.onChangePassword}>
                    <Form.Group controlId="passwordOne">
                        <Form.Control 
                            name="passwordOne"
                            value={passwordOne}
                            onChange={this.onChange}
                            type="password"
                            placeholder="New Password"
                            maxLength="100"
                        />
                    </Form.Group>
                    <Form.Group controlId="passwordTwo">
                        <Form.Control 
                            name="passwordTwo"
                            value={passwordTwo}
                            onChange={this.onChange}
                            type="password"
                            placeholder="Confirm New Password"
                            maxLength="100"                            
                        />
                    </Form.Group>
                    
                    <Button variant="success" type="submit" disabled={isPasswordInvalid}>
                        Change My Password
                    </Button>
            
                    {error && <p>{error.message}</p>}
                </Form>
                
                <h4>Change Username</h4>
                <Form onSubmit={this.onChangeUsername}>
                    <Form.Group controlId="username">
                        <Form.Control 
                            name="username"
                            value={username}
                            onChange={this.onChange}
                            type="text"
                            placeholder="New Username"
                            maxLength="25"
                        />
                    </Form.Group>
                    
                    <Button variant="success" type="submit" disabled={isUsernameInvalid}>
                        Change My Username
                    </Button>
            
                    {error && <p>{error.message}</p>}
                </Form>

                <h4>Change Email</h4>
                <Form onSubmit={this.onChangeEmail}>
                    <Form.Group controlId="email">
                        <Form.Control 
                            name="email"
                            value={email}
                            onChange={this.onChange}
                            type="text"
                            placeholder="New Email"
                            maxLength="25"
                        />
                    </Form.Group>
                    
                    <Button variant="success" type="submit" disabled={isEmailInvalid}>
                        Change My Email
                    </Button>
            
                    {error && <p>{error.message}</p>}
                </Form>
            </Container>
        );
    }
}

const condition = authUser => !!authUser;
  
export default withAuthorization(condition)(withFirebase(Account));