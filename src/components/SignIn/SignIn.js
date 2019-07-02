import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { SignUpLink } from '../SignUp/SignUp';
import { withFirebase } from '../Firebase/Firebase';
import * as ROUTES from '../../constants/routes';

import Jumbotron from 'react-bootstrap/Jumbotron';
import { Form, Button } from 'react-bootstrap';

const SignIn = () => (
  	<Jumbotron>
    	<h1>Sign in</h1>
    	<SignInForm />
    	<SignUpLink />
  	</Jumbotron>
);

const INITIAL_STATE = {
  	email: '',
  	password: '',
  	error: null,
};

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
			<Form>
				<Form.Group controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control 
						name="email"
						value={email}
						onChange={this.onChange}
						type="text"
						placeholder="Email Address" 
					/>
					<Form.Text className="text-muted">
						Your email address will never be shared with anyone else.
					</Form.Text>
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
				
				<Button variant="primary" type="submit" disabled={isInvalid}>
					Sign in
				</Button>
			</Form>
    	);
  	}
}

const SignInForm = compose(
  	withRouter,
  	withFirebase,
)(SignInFormBase);

export default SignIn;

export { SignInForm };