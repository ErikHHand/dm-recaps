import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase/Firebase';
import * as ROUTES from '../../constants/routes';

import { Form, Button } from 'react-bootstrap';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

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
		
		this.state = { ...INITIAL_STATE };

		// Set the context for "this" for the following functions
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
  	}

	onSubmit(event) {
		const { username, email, passwordOne } = this.state;

		this.props.firebase
		.doCreateUserWithEmailAndPassword(email, passwordOne)
		.then(authUser => {

			authUser.user.sendEmailVerification();

			this.props.firebase.db.collection("users").doc(authUser.user.uid).set({
				username: username,
			})
			.then(
				console.log("Document written with ID: ", authUser.user.uid)
			)
			.catch(function(error) {
				console.error("Error adding document: ", error);
			});

			authUser.user.updateProfile({
				displayName: username,
			  }).then(() => {
				console.log("Document successfully updated!");
			  }).catch((error) => {
				console.log("Error updating document:", error);
			  });  
			  
		})
		.then(authUser => {
			this.setState({ ...INITIAL_STATE });
			this.props.history.push(ROUTES.HOME);
		})
		.catch(error => {
			this.setState({ error });
		});

		event.preventDefault();
	}

	onChange(event) {
		this.setState({ [event.target.name]: event.target.value });
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
			<Form onSubmit={this.onSubmit}>
				<Form.Group controlId="formBasicUsername">
					<Form.Label>Username</Form.Label>
					<Form.Control 
						name="username"
						value={username}
						onChange={this.onChange}
						type="text"
						placeholder="Username"
						maxLength="25"
					/>
				</Form.Group>
				<Form.Group controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control 
						name="email"
						value={email}
						onChange={this.onChange}
						type="email"
						placeholder="Email address"
						maxLength="100"
					/>
					<Form.Text className="text-muted">
						Your email address will never be shared with anyone else.
					</Form.Text>
				</Form.Group>
				<Form.Group controlId="formBasicPassword">
					<Form.Label>Password</Form.Label>
					<Form.Control 
						name="passwordOne"
						value={passwordOne}
						onChange={this.onChange}
						type="password"
						placeholder="Password"
						maxLength="100"
					/>
				</Form.Group>
				<Form.Group controlId="formBasicPassword2">
					<Form.Label>Password</Form.Label>
					<Form.Control 
						name="passwordTwo"
						value={passwordTwo}
						onChange={this.onChange}
						type="password"
						placeholder="Confirm Password"
						maxLength="100"
					/>
				</Form.Group>
				<Row>
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
				{error && <p>{error.message}</p>}
			</Form>
		);
	}
}

const SignUp = compose(
	withRouter,
	withFirebase,
)(SignUpFormBase);

export default SignUp;

export { SignUp };