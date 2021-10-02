import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';

import SignIn from "./../SignIn/SignIn";
import SignUp from "./../SignUp/SignUp";
import Jumbotron from 'react-bootstrap/Jumbotron';

import './../../styles.css';

/*
	This class holds the page that a user lands on when not being signed in.
	It holds the sign in and sign up components.
*/
class Landing extends Component {
  
  	constructor(props) {
		super(props);

		this.state = {
			signIn: true,
		}

		this.changeWindow = this.changeWindow.bind(this);
	}

	//This function switches between the sign in and the sign up windows.
	changeWindow() {
		this.setState({
			signIn: !this.state.signIn,
		})
	}
	  
	render() {
		let title = "Dungeon Master Recaps"

		return (
			<Row noGutters={true}>
				<Col xs={0} md={3}></Col>
				<Col xs={12} md={6}>
					<h1 className="center"> {title} </h1>
					<Jumbotron className="jumbotron-box">
						{this.state.signIn ?
							<SignIn changeWindow = {this.changeWindow}/> : 
							<SignUp changeWindow = {this.changeWindow}/> 
						}
					</Jumbotron> 
				</Col>
				<Col xs={0} md={3}></Col>
			</Row>
		)
	}
}
  
export default Landing;