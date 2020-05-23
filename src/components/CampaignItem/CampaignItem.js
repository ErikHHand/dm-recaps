import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';

import { Link } from "react-router-dom";

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This class holds the Campaign Items on the Campaign Page.
	This class holds the layout as well as the function for deleting
*/
class CampaignItem extends Component {

	constructor(props) {
		super(props);

		this.state = {
			border: ""
		};

		// Set the context for "this" for the following function
		this.deleteCampaign = this.deleteCampaign.bind(this);
	}

	addBorder() {
		this.setState({
			border: "info"
		});
	}

	removeBorder() {
		this.setState({
			border: ""
		});
	}


	// Triggers when deleting a campaign
	deleteCampaign() {

		// Delete campaign on Firestore
		this.props.campaignsRef.doc(this.props.campaignID).delete()
		.then(function() {
			console.log("Document successfully deleted!");
		}).catch(function(error) {
			console.log("Error deleting document:", error);
		});

		// Delete campaign locally
		let campaigns = this.props.campaigns;
		delete campaigns[this.props.campaignID];
		this.props.handleCampaigns(campaigns);
	}

	render() {

		// Text for pop-up when deleting
		const deleteText = {
			title: "Delete campaign: " + this.props.campaign.name,
			text: "Are you sure you want to delete this campaign and ALL THE NOTES you have written for it? There is no going back after confirming this!"
		};

		// Create date for comparision with the latest session date
		let date = new Date();
		let dateDifference = -1;

		// Calculate time between latest session and today, if there are any sessions
		if(this.props.campaign.sessionOrder[0]) {
			let lastSessionDate = {};
			if(this.props.campaign.sessions[this.props.campaign.sessionOrder[0]].date instanceof Date) {
				lastSessionDate = this.props.campaign.sessions[this.props.campaign.sessionOrder[0]].date;
			} else {
				lastSessionDate = this.props.campaign.sessions[this.props.campaign.sessionOrder[0]].date.toDate();
			}
			dateDifference = Math.ceil(Math.abs(date - lastSessionDate) / (1000 * 60 * 60 * 24));
		}

		// Enter calculated date, if there are any sessions
		let lastSession = "No sessions yet";
		if(dateDifference > -1) {
			lastSession = "Last session: " + dateDifference + " days ago";
		}

		let description = "No campaign description";
		if(this.props.campaign.description) {
			description = this.props.campaign.description;
		}
		
		return (
			<>
				<Card 
					border={this.state.border} 
					className="text-center campaign-item"
				>
					<Card.Header>
						<Row>
							<Col md="1"></Col>
							<Col md="10" className="text-muted">
								{this.props.campaign.world}
							</Col>
							<Col md="1" className="center">
								<ItemMenu
									edit = {() => this.props.editCampaign(
										this.props.campaignID,
										this.props.campaign
									)}
									delete = {this.deleteCampaign}
									deleteText = {deleteText}
								/>
							</Col>
						</Row>
					</Card.Header>
					<Link to={{
						pathname: "/campaigns/"+ this.props.campaignID,
						state: {
							campaign: this.props.campaign,
							id: this.props.campaignID,
						}
					}}>
						<Card.Body
							onMouseOver={() => this.addBorder()} 
                    		onMouseOut={() => this.removeBorder()}
						>
							<Card.Title>{this.props.campaign.name}</Card.Title>
							<Card.Text>{description}</Card.Text>
						</Card.Body>
					</Link>
					<Card.Footer className="text-muted">{lastSession}</Card.Footer>
				</Card>
			</>
		);
	}
}

export default withFirebase(CampaignItem)