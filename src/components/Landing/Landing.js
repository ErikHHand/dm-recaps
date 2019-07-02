import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import SignIn from "./../SignIn/SignIn";
import SignUp from "./../SignUp/SignUp";

import './../../styles.css';

class Landing extends Component {
  
  	constructor(props) {
		super(props);

		this.state = {
			signIn: true,
			signUp: false,
		}
	}

	changeSignIn() {
		this.setState({
			signIn: !this.state.signIn,
			signUp: !this.state.signUp
		})
	}
	  
	render() {
		let title = "Dungeon Master Recaps"

		return (
			<Row>
				<Col xs={0} md={3}></Col>
				<Col xs={12} md={6}>
					<h1 className="center"> {title} </h1>
					<SignIn/>
				</Col>
				<Col xs={0} md={3}></Col>
			</Row>
		)
	}
}
  
export default Landing;