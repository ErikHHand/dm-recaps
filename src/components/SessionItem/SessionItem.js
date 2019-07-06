import React, { Component } from 'react';

import { firestore } from 'firebase';

import Card from 'react-bootstrap/Card'

class SessionItem extends Component {

	constructor(props) {
		super(props);
	}

	render() {

		//console.log(this.props.session.date);
		let date = this.props.session.date;
		date = new Date(date.seconds * 1000);
		
		return (
			<Card border="primary" style={{ width: "18rem"}}>
				<Card.Body>
					<Card.Title>{date.toDateString()}</Card.Title>
					<Card.Text>{this.props.session.description}</Card.Text>
				</Card.Body>
			</Card>
		);
	}
}

export default SessionItem