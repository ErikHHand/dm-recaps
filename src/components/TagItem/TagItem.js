import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

class TagItem extends Component {

	render() {	
		
		const deleteText = {
			title: "Delete Tag",
			text: "Are you sure you want to delete this session and remove it from all recaps?"
		}

		return (
			<Card 
				className="tag" 
				style={{ backgroundColor: this.props.tag.colour}}
				onClick = {this.props.handleClick}
			>
				<Card.Body>
					<Card.Subtitle>
						<Row>
							<Col xs="9">
							</Col>
							<Col xs="3" className="center">
								<ItemMenu
									deleteText = {deleteText}
								/>
							</Col>
						</Row>
					</Card.Subtitle>
					<Card.Text className="tag-text text-white">
						{this.props.tag.name}
					</Card.Text>
				</Card.Body>
			</Card>
		);
	}
}

export default TagItem