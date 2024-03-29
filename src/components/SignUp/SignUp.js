import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase/Firebase';
import * as ROUTES from '../../constants/routes';

import { Form, Button } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'

const INITIAL_STATE = {
	username: '',
	email: '',
	passwordOne: '',
	passwordTwo: '',
	error: null,
};

/*
	This class holds the sign up window and handles
	adding new users to Firestore
*/
class SignUpFormBase extends Component {
  	constructor(props) {
		super(props);
		
		this.state = { 
			...INITIAL_STATE,
			showError: false,
		};

		// Set the context for "this" for the following functions
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
  	}

	// Triggers when submitting fields for creating a new user
	onSubmit(event) {
		const { username, email, passwordOne } = this.state;

		let usernameRef = this.props.firebase.db.collection("usernames").doc(username);

		// First check if the username is taken
		// If the username is not taken a new user is created
		usernameRef.get().then((usernameDoc) => {
			if(!usernameDoc.exists) {
				this.props.firebase.doCreateUserWithEmailAndPassword(email, passwordOne)
				.then(authUser => {

					// Send email for verifying the account
					authUser.user.sendEmailVerification();

					// Add the user to the users collection
					this.props.firebase.db.collection("users").doc(authUser.user.uid).set({
						username: username,
						lastCampaignID: "",
						lastCampaignName: "",
						ownedCampaigns: [],
					}).then(
						console.log("Document written with ID: ", authUser.user.uid)
					).catch((error) => {
						console.error("Error adding document: ", error);
					});

					// Add user to the usernames collection 
					this.props.firebase.db.collection("usernames").doc(username).set({
						uid: authUser.user.uid,
					}).then(
						console.log("Document written with ID: ", username)
					).catch((error) => {
						console.error("Error adding document: ", error);
					});

					// Update the displayName field on the user object
					authUser.user.updateProfile({
						displayName: username,
					}).then(() => {
						console.log("Document successfully updated!");
					}).catch((error) => {
						console.log("Error updating document:", error);
					});  
					
				}).then(authUser => {

					// Reset state and navigaete to the campaigns pags
					this.setState({ ...INITIAL_STATE });
					this.props.history.push(ROUTES.HOME);
				}).catch(error => {
					console.log("Error creating account:", error);
					this.setState({ 
						error: error,
						showError: true,
					});
				});
			} else {
				this.setState({ 
					error: {message: "Username is not available. Please choose a different username."},
					showError: true,
				});
			}
		}).catch((error) => {
			console.log("Error creating account:", error);
			this.setState({ 
				error: error,
				showError: true,
			});
		});	
		event.preventDefault();
	}

	// Triggers when editing a field in the sign up window
	onChange(event) {
		this.setState({ 
			[event.target.name]: event.target.value,
			showError: false,
		});
	};

	render() {
		const {
			username,
			email,
			passwordOne,
			passwordTwo,
			error,
		} = this.state;

		const isInvalid =
			passwordOne !== passwordTwo ||
			passwordOne === '' ||
			email === '' ||
			username === '';

		return (
			<>
				<h3 className="landing-subtitle">Sign up</h3>
				<Form onSubmit={this.onSubmit}>
					<FloatingLabel controlId="formBasicUsername" className="mb-3" label="Username">
						<Form.Control 
							name="username"
							value={username}
							onChange={this.onChange}
							type="text"
							placeholder="Username"
							maxLength="25"
						/>
					</FloatingLabel>
					<FloatingLabel controlId="formBasicEmail" className="mb-3" label="Email address">
						<Form.Control 
							name="email"
							value={email}
							onChange={this.onChange}
							type="email"
							placeholder="Email address"
							maxLength="100"
						/>
					</FloatingLabel>
					<FloatingLabel controlId="formBasicPassword" className="mb-3" label="Password">
						<Form.Control 
							name="passwordOne"
							value={passwordOne}
							onChange={this.onChange}
							type="password"
							placeholder="Password"
							maxLength="100"
						/>
					</FloatingLabel>
					<FloatingLabel controlId="formBasicPassword2" className="mb-3" label="Repeat Password">
						<Form.Control 
							name="passwordTwo"
							value={passwordTwo}
							onChange={this.onChange}
							type="password"
							placeholder="Type password again"
							maxLength="100"
						/>
					</FloatingLabel>
					<Row className="button-row">
						<Col>
							<Button variant="success" type="submit" disabled={isInvalid}>
								Sign up
							</Button>
						</Col>
						<Col className="right-align">
							<Button variant="secondary" onClick={this.props.changeWindow}>
								Back to sign in
							</Button>
						</Col>
					</Row>
					<Alert
						className="alert-margin-top"
						variant="danger" 
						show={this.state.showError} 
						onClose={() => this.setState({showError: false})} 
						dismissible
					>
						{error && <p>{error.message}</p>}
					</Alert>
				</Form>
			</>
		);
	}
}

const SignUp = compose(
	withRouter,
	withFirebase,
)(SignUpFormBase);

export default SignUp;

export { SignUp };