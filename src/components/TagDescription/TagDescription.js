import React, { Component } from 'react';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This class holds the Tag Description on the right, top side of the Tags Page.
*/
class TagDescription extends Component {
	constructor(props) {
		super(props);
	}

	render() {	
		
		let noDescription = "This tag has no description";

		return (
			<>
				<Card className="tag-description" border="" bg="light">
					<Card.Body>
						<Card.Title className="">
							{this.props.tag.name}
						</Card.Title>
						<Card.Text>
							{this.props.tag.description ? this.props.tag.description : noDescription}
						</Card.Text>
					</Card.Body>
				</Card>
			</>
		);
	}
}

export default withFirebase(TagDescription)