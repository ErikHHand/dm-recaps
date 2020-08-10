import React, { Component } from 'react';

import { withFirebase } from '../Firebase/Firebase';
import { withAuthorization } from '../Session/Session';

import Navbar from '../Navbar/Navbar';

import { Form, Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container'


const INITIAL_STATE = {
    passwordOne: '',
    passwordTwo: '',
    error: null,
};

class Account extends Component {
    constructor(props) {
        super(props);
     
        this.state = { ...INITIAL_STATE };

        // Set the context for "this" for the following functions
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(event) {
        const { passwordOne } = this.state;
     
        this.props.firebase
            .doPasswordUpdate(passwordOne)
            .then(() => {
                this.setState({ ...INITIAL_STATE });
            })
            .catch(error => {
                this.setState({ error });
            });
     
        event.preventDefault();
    };

    onChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { passwordOne, passwordTwo, error } = this.state;
     
        /*const isInvalid =
            passwordOne !== passwordTwo || passwordOne === '';
        */

        return (
            <Container>
                <Navbar/>
                <h1 className="border-bottom">Account</h1>
                <h4>Password Reset</h4>
                <Form onSubmit={this.onSubmit} inline>
                    <Form.Group controlId="passwordOne">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control 
                            name="passwordOne"
                            value={passwordOne}
                            onChange={this.onChange}
                            type="password"
                            placeholder="New Password"
                            className="mx-sm-3"
                        />
                    </Form.Group>
                    <Form.Group controlId="passwordTwo">
                        <Form.Label>Repeat Password</Form.Label>
                        <Form.Control 
                            name="passwordTwo"
                            value={passwordTwo}
                            onChange={this.onChange}
                            type="password"
                            placeholder="Confirm New Password"
                            className="mx-sm-3"
                        />
                    </Form.Group>
                    
                    <Button variant="success" type="submit" disabled={true}>
                        Reset My Password
                    </Button>
            
                    {error && <p>{error.message}</p>}
                </Form>
            </Container>
        );
    }
}

const condition = authUser => !!authUser;
  
export default withAuthorization(condition)(withFirebase(Account));