import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

class SessionItem extends Component {

	render() {

		let date = this.props.session.date;
		date = new Date(date.seconds * 1000);		
		
		return (
			<Card border="primary" style={{ width: "18rem"}} onClick = {this.props.click}>
				<Card.Body>
					<Card.Title>
						<Row>
							<Col md="9">
								{date.toDateString()} 
							</Col>
							<Col md="3" className="center">
								<ItemMenu/>
							</Col>
						</Row>
					</Card.Title>
					<Card.Text>{this.props.session.description}</Card.Text>
				</Card.Body>
			</Card>
		);
	}
}

export default SessionItem