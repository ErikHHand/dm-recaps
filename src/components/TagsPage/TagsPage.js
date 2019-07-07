import React, { Component } from 'react';

import RecapItem from '../RecapItem/RecapItem';
import TagItem from '../TagItem/TagItem';
import NewSession from '../NewSession/NewSession';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
//import Form from 'react-bootstrap/Form'
import Badge from 'react-bootstrap/Badge'

class TagsPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			showAddWindow: false,
			id: this.props.id,
			currentTag: null,
		};
	}

	render() {

		let recapItems = <div></div>;

		return (
			<Row>
				<Col md={3}>
					<TagItem></TagItem>
					{/*tags*/}
					<div className="center">
						<Button variant="success" onClick={() => this.setState({ showAddWindow: true })}>New Tag</Button>
					</div>
					<NewSession 
						show = {this.state.showAddWindow}
						onHide = {() => this.setState({ showAddWindow: false })}
						sessions = {this.props.sessions}
						handleSessions = {this.props.handleSessions}
						id = {this.state.id}
					/>
				</Col>
				<Col md={9}>
					{recapItems}
				</Col>
			</Row>
		)
	}
}

export default TagsPage