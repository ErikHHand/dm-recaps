import React, { Component } from 'react';
import { withAuthorization } from '../Session/Session';

import NewCampaign from '../NewCampaign/NewCampaign';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';

class HomePage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			campaigns: ["Stuff", "More Stuff"],
			showAddWindow: false,
		}

		this.handleCampaigns = this.handleCampaigns.bind(this);
	}

	handleCampaigns(campaigns) {
		this.setState({
			campaigns: campaigns,
		})
	}

	render() {

		let campaigns = <div></div>

		return (
			<Jumbotron fluid className="container">
				<h1 className="center">Campaigns</h1>
				{campaigns}
				<div className="center">
					<Button variant="success" onClick={() => this.setState({ showAddWindow: true })}>Create a new campaign!</Button>
				</div>
				<NewCampaign 
					show = {this.state.showAddWindow}
					onHide = {() => this.setState({ showAddWindow: false })}
					campaigns = {this.state.campaigns}
					handleCampaigns = {this.handleCampaigns}
				/>
			</Jumbotron>
		)
	}
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(HomePage);