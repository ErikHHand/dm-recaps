import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase/Firebase';
import * as ROUTES from '../../constants/routes';

import { Form, Button } from 'react-bootstrap';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'

const INITIAL_STATE = {
  	email: '',
  	password: '',
  	error: null,
};

/*
	This class holds the sign in window as well as the window
	for filling in email when you have forgotten your password.
*/
class SignInFormBase extends Component {
  	constructor(props) {
    	super(props);

		this.state = { 
			...INITIAL_STATE,
			signIn: true,
			showConfirm: false,
			showError: false,
		};
		
		// Set the context for "this" for the following functions
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.onSubmitForgotPassword = this.onSubmitForgotPassword.bind(this);
		this.changeWindow = this.changeWindow.bind(this);
  	}

	// Triggers when a users submits credidentials for signing in
  	onSubmit(event) {
    	const { email, password } = this.state;
		event.preventDefault();

    	this.props.firebase.doSignInWithEmailAndPassword(email, password)
		.then(() => {
			this.setState({ ...INITIAL_STATE });
			this.props.history.push(ROUTES.HOME);
		}).catch(error => {
			this.setState({ 
				error: error,
				showError: true,
			});
		});
  	};

	// Triggers when editing a field in the sign in window 
	// or in the forgot password window
  	onChange(event) {
    	this.setState({ 
			[event.target.name]: event.target.value,
			showError: false,
		});
  	};

	// Triggers when submitting email in the forgot password window
	onSubmitForgotPassword(event) {
		const { email } = this.state;

		this.props.firebase.auth.sendPasswordResetEmail(email)
		.then(() => {
			this.setState({ 
				...INITIAL_STATE,
				showConfirm: true,
			});
		}).catch(error => {
			this.setState({ 
				error: error,
				showError: true,
			});
		});
		event.preventDefault();
	}

	// Triggers when switching between the sign in and
	// the forgot password window
	changeWindow() {
		this.setState({
			signIn: !this.state.signIn,
			showConfirm: false,
		})
	}

  	render() {

    	const { email, password, error, signIn } = this.state;

    	const isSignInInvalid = password === '' || email === '';
    	const isResetInvalid = email === '';

		let signInForm = 
			<>
				<h1>Sign in</h1>
				<Form onSubmit={this.onSubmit}>
					<Form.Group controlId="formBasicEmail">
						<Form.Label>Email address</Form.Label>
						<Form.Control 
							name="email"
							value={email}
							onChange={this.onChange}
							type="email"
							placeholder="Email Address" 
						/>
					</Form.Group>

					<Form.Group controlId="formBasicPassword">
						<Form.Label>Password</Form.Label>
						<Form.Control 
							name="password"
							value={password}
							onChange={this.onChange}
							type="password"
							placeholder="Password"
						/>
					</Form.Group>
					
					<Row>
						<Col>
							<Button variant="success" type="submit" disabled={isSignInInvalid}>
								Sign in
							</Button>
						</Col>
						<Col className="right-align">
							<Button variant="primary" onClick={this.props.changeWindow}>
								Sign up
							</Button>
						</Col>
					</Row>
					<p className="forgot-password-text" onClick={this.changeWindow}>Forgot password?</p>
					<Alert 
						variant="danger" 
						show={this.state.showError} 
						onClose={() => this.setState({showError: false})} 
						dismissible
					>
						{error && <p>{error.message}</p>}
					</Alert>
				</Form>
			</>;

		let forgotPasswordForm = 
			<>
				<h1>Forgot Password</h1>
				<Form onSubmit={this.onSubmitForgotPassword}>
					<Form.Group controlId="formBasicEmail">
						<Form.Label>Email address</Form.Label>
						<Form.Control 
							name="email"
							value={email}
							onChange={this.onChange}
							type="email"
							placeholder="Email address for password reset link" 
						/>
					</Form.Group>
					
					<Row>
						<Col>
							<Button variant="success" type="submit" disabled={isResetInvalid}>
								Reset Password
							</Button>
						</Col>
						<Col className="right-align">
							<Button variant="primary" onClick={this.changeWindow}>
								Back to sign in
							</Button>
						</Col>
					</Row>
					<Alert 
						className="alert-margin-top"
						variant="info" 
						show={this.state.showConfirm} 
						onClose={() => this.setState({showConfirm: false})} 
						dismissible
					>
						Email with instructions on how to reset password has been sent to your email.
					</Alert>
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
			</>;

    	return (
			signIn ? signInForm : forgotPasswordForm
    	);
  	}
}

const SignIn = compose(
  	withRouter,
  	withFirebase,
)(SignInFormBase);

export default SignIn;

export { SignIn };