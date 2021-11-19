import React, { Component } from 'react';

import SignIn from "./../SignIn/SignIn";
import SignUp from "./../SignUp/SignUp";
import Container from 'react-bootstrap/Container';

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
		let title = "RPG Recaps"

		return (
			<Container fluid="sm" className="container-landing container-all">
				<h1 className="center border-bottom"> {title} </h1>
				{this.state.signIn ?
					<SignIn changeWindow = {this.changeWindow}/> : 
					<SignUp changeWindow = {this.changeWindow}/> 
				}
			</Container> 
		)
	}
}
  
export default Landing;