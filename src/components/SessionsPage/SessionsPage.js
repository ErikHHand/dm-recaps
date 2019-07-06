import React, { Component } from 'react';

import NewSession from '../NewSession/NewSession';
import SessionItem from '../SessionItem/SessionItem';
import RecapItem from '../RecapItem/RecapItem';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';

class SessionsPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			showAddWindow: false,
			id: this.props.id,
			currentSession: null,
		};
	}

	render() {

		let sessionsPage = this;

		let sessions = Array.from(Object.keys(this.props.sessions)).map((sessionID)=>
			<SessionItem 
				key = {sessionID}
				session = {this.props.sessions[sessionID]}
				click = {() => sessionsPage.setState({currentSession: sessionID})}
			/>
		);

		let recapItems;

		if(this.state.currentSession === null) {
			recapItems = <div></div>;
		} else {
			let recapList = this.props.sessions[this.state.currentSession].recaps;
			recapItems = recapList.map((recapItem)=>
				<RecapItem 
					key = {recapList.indexOf(recapItem)}
					recapItem = {recapItem}
				/>
			);
		}

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
					{recapItems}
				</Col>
			</Row>
		)
	}
}

export default SessionsPage