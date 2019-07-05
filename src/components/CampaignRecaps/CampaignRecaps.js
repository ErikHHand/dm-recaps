import React, { Component } from 'react';

import SessionsPage from '../SessionsPage/SessionsPage';
import TagsPage from '../TagsPage/TagsPage';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'

class CampaignRecaps extends Component {

	constructor(props) {
		super(props);

		this.state = {
			key: 'sessions',
		};
	}

	render() {
		return (
			<Jumbotron fluid className="container">
				<Tab.Container defaultActiveKey="sessions">
					<Row>
						<Col>
							<Nav variant="tabs" className="justify-content-center">
								<Nav.Item>
									<Nav.Link eventKey="sessions">Sessions</Nav.Link>
								</Nav.Item>
								<Nav.Item>
									<Nav.Link eventKey="tags">Tags</Nav.Link>
								</Nav.Item>
							</Nav>
						</Col>
					</Row>
						
					<Tab.Content>
						<Tab.Pane eventKey="sessions">
							<SessionsPage />
						</Tab.Pane>
						<Tab.Pane eventKey="tags">
							<TagsPage />
						</Tab.Pane>
					</Tab.Content>
						
					
				</Tab.Container>
				
			</Jumbotron>
		)
	}
}

export default CampaignRecaps