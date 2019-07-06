import React, { Component } from 'react';

import NewSession from '../NewSession/NewSession';
import SessionItem from '../SessionItem/SessionItem';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button';

class SessionsPage extends Component {

	constructor(props) {
		super(props);

		console.log(this.props.sessions);

		this.state = {
			showAddWindow: false,
			id: this.props.id,
		};
	}

	render() {

		let sessions = Array.from(Object.keys(this.props.sessions)).map((sessionID)=>
			<SessionItem 
				key = {sessionID}
				session = {this.props.sessions[sessionID]}
			/>
		);

		return (
			<Row>
				<Col md={3}>
					{sessions}
					<div className="center">
						<Button variant="success" onClick={() => this.setState({ showAddWindow: true })}>New Session</Button>
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
					<Card body>This is some text within a card body.</Card>
					<Card body>This is some text within a card body.</Card>
					<Card body>This is some text within a card body.</Card>
					<Card body>This is some text within a card body.</Card>
					<Card body>This is some text within a card body.</Card>
					<Card body>This is some text within a card body.</Card>
					<Card body>This is some text within a card body.</Card>
					<Card body>This is some text within a card body.</Card>
				</Col>
			</Row>
		)
	}
}

export default SessionsPage