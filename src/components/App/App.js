import React, { Component } from 'react';

import Navigation from  "../Navigation/Navigation";
import SignOutButton from '../SignOut/SignOut';

import { withAuthentication, AuthUserContext } from '../Session/Session';

import { Navbar, Col } from 'react-bootstrap';

import './App.css';
import './../../styles.css';

require('dotenv').config()

class App extends Component {

	
	
  	render() {
		console.log(process.env.REACT_APP_DATABASE_URL);
		return (
			<div className="App">
				<Navbar variant="dark">
					<Col/>
					<AuthUserContext.Consumer>
						{authUser =>
							authUser? <SignOutButton/> : <div/>}
					</AuthUserContext.Consumer>
				</Navbar>

				<Navigation/>
			</div>
		);
	}
}

export default withAuthentication(App);
