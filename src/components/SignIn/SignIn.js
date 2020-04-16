import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase/Firebase';
import * as ROUTES from '../../constants/routes';

import { Form, Button } from 'react-bootstrap';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const INITIAL_STATE = {
  	email: '',
  	password: '',
  	error: null,
};

/*
	This class holds the main sign in window
*/
class SignInFormBase extends Component {
  	constructor(props) {
    	super(props);

    	this.state = { ...INITIAL_STATE };
  	}

  	onSubmit = event => {
    	const { email, password } = this.state;

    	this.props.firebase
		.doSignInWithEmailAndPassword(email, password)
		.then(() => {
			this.setState({ ...INITIAL_STATE });
			this.props.history.push(ROUTES.HOME);
		})
		.catch(error => {
			this.setState({ error });
		});

    	event.preventDefault();
  	};

  	onChange = event => {
    	this.setState({ [event.target.name]: event.target.value });
  	};

  	render() {
    	const { email, password, error } = this.state;

    	const isInvalid = password === '' || email === '';

    	return (
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
					<Col md={2}>
						<Button variant="success" type="submit" disabled={isInvalid}>
							Sign in
						</Button>
					</Col>
					<Col md={8}>
					</Col>
					<Col md={2}>
						<Button variant="primary" onClick={this.props.changeWindow}>
							Sign up
						</Button>
					</Col>
				</Row>
				{error && <p>{error.message}</p>}
			</Form>
    	);
  	}
}

const SignIn = compose(
  	withRouter,
  	withFirebase,
)(SignInFormBase);

export default SignIn;

export { SignIn };