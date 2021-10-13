import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';
import CampaignInfo from '../CampaignInfo/CampaignInfo';
import CampaignSharing from '../CampaignSharing/CampaignSharing';


import { Link } from "react-router-dom";

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { withFirebase } from '../Firebase/Firebase';

/*
	This class holds the Campaign Items on the Campaign Page.
	This class holds the layout as well as the function for deleting a campaign.
*/
class CampaignItem extends Component {

	constructor(props) {
		super(props);

		this.state = {
			showCampaignInfo: false,
			border: ""
		};

		// Set the context for "this" for the following function
		this.deleteCampaign = this.deleteCampaign.bind(this);
	}

	// Function called when hovering over a campaign item
	// which will add a visible border to it.
	addBorder() {
		this.setState({
			border: "info"
		});
	}

	// Function to remove border when moving cursor away from a campaign item
	removeBorder() {
		this.setState({
			border: ""
		});
	}

	// Triggers when deleting a campaign
	deleteCampaign() {

		// Delete campaign on Firestore
		this.props.campaignsRef.doc(this.props.campaignID).delete()
		.then(() => {
			console.log("Document successfully deleted!");
			// Delete campaign locally
			let campaigns = this.props.campaigns;
			delete campaigns[this.props.campaignID];
			this.props.handleCampaigns(campaigns);
		}).catch((error) => {
			console.log("Error deleting campaign:", error);
			this.props.handleError(error, "Could not delete campaign");
		});
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

		// Set campaign description, or a placeholder if there is no description
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
							<Col md="1">
								<CampaignSharing
									campaignID = {this.props.campaignID}
									campaign = {this.props.campaign}
									campaigns = {this.props.campaigns}
									handleCampaigns = {this.props.handleCampaigns}
									campaignsRef = {this.props.campaignsRef}
									handleError = {this.props.handleError}
								/>
							</Col>
							<Col md="10" className="text-muted">
								{this.props.campaign.world}
							</Col>
							<Col md="1" className="center">
								<ItemMenu
									edit = {() => this.setState({ showCampaignInfo: true})}
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
							activeTab: this.props.campaign.activeTab,
						}
					}}>
						<Card.Body
							onMouseOver={() => this.addBorder()} 
                    		onMouseOut={() => this.removeBorder()}
						>
							<Card.Title>{this.props.campaign.name}</Card.Title>
							<Card.Text className="with-line-breaks regular-text">{description}</Card.Text>
						</Card.Body>
					</Link>
					<Card.Footer className="text-muted">{lastSession}</Card.Footer>
				</Card>
				<CampaignInfo 
					show = {this.state.showCampaignInfo}
					onHide = {() => this.setState({ showCampaignInfo: false })}
					campaignID = {this.props.campaignID}
					campaign = {this.props.campaign}
					campaigns = {this.props.campaigns}
					handleCampaigns = {this.props.handleCampaigns}
					campaignsRef = {this.props.campaignsRef}
					edit = {true}
					handleError = {this.props.handleError}
				/>
			</>
		);
	}
}

export default withFirebase(CampaignItem)