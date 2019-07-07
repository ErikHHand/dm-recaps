import React, { Component } from 'react';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'

class RecapItem extends Component {

	render() {

		console.log(this.props.recapItem);

		let tags = this.props.recapItem.tags.map((tag) =>
			<Badge pill variant={this.props.tags[tag].colour} key={this.props.recapItem.tags.indexOf(tag)}>
				{tag}
			</Badge>
		);
		
		return (
			<Card body onClick = {this.props.click}>
				<Row>
					<Col>{this.props.recapItem.text}</Col>
				</Row>
				<Row>
					<Col>
						<div className="right-align">
							{tags}
							<Badge pill variant="light" className="add-tag">+</Badge>
						</div>
					</Col>
				</Row>
			</Card>
		)
	}
}

export default RecapItem