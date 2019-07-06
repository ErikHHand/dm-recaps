import React, { Component } from 'react';

import Card from 'react-bootstrap/Card'

class SessionItem extends Component {

	render() {

		let date = this.props.session.date;
		date = new Date(date.seconds * 1000);		
		
		return (
			<Card border="primary" style={{ width: "18rem"}} onClick = {this.props.click}>
				<Card.Body>
					<Card.Title>{date.toDateString()}</Card.Title>
					<Card.Text>{this.props.session.description}</Card.Text>
				</Card.Body>
			</Card>
		);
	}
}

export default SessionItem