import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';
import CampaignInfo from '../CampaignInfo/CampaignInfo';
import CampaignSharing from '../CampaignSharing/CampaignSharing';

import { Link } from "react-router-dom";

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase';

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

		// Set the context for "this" for the following functions
		this.deleteCampaign = this.deleteCampaign.bind(this);
		this.updateLastVisitedCampaign = this.updateLastVisitedCampaign.bind(this);
	}

	// Triggers when deleting a campaign
	deleteCampaign() {

		// Delete campaign on Firestore
		this.props.campaignsRef.doc(this.props.campaignID).delete()
		.then(() => {
			console.log("Document successfully deleted!");

			// Delete campaign from user document
			this.props.firebase.db.collection("users").doc(this.props.campaign.ownerID).update({
				ownedCampaigns: firebase.firestore.FieldValue.arrayRemove(this.props.campaignID)
			}).then(() => {
				console.log("Campaign successfully deleted from user document!");
			}).catch((error) => {
				console.log("Error deleting campaign from user document:", error);
			});

			// If this is the last visited campaign, remove from user data
			if(this.props.campaignID === this.props.userDataContext.userData.lastCampaignID) {
				// Update on Firetore
				this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid).update({
					lastCampaignName: "",
					lastCampaignID: "",
				}).then(() => {
					console.log("User data successfully updated!");
					// Update locally
					this.props.userDataContext.updateUserData({
						lastCampaignID: "",
						lastCampaignName: "",
					});
				}).catch((error) => {
					console.log("Error updating user data:", error);
				});
			}

			// Delete campaign locally
			let campaigns = this.props.campaigns;
			delete campaigns[this.props.campaignID];
			this.props.handleCampaigns(campaigns);
		}).catch((error) => {
			console.log("Error deleting campaign:", error);
			this.props.handleError(error, "Could not delete campaign");
		});
	}

	updateLastVisitedCampaign() {

		let userRef = this.props.firebase.db.collection("users")
			.doc(this.props.firebase.auth.currentUser.uid);
			
		// Only update user data if this wasn't the last visited campaign
		if(this.props.userDataContext.userData.lastCampaignID !== this.props.campaignID) {
			// Update info about last visited campaign to backend
			userRef.update({
				lastCampaignName: this.props.campaign.name,
				lastCampaignID: this.props.campaignID,
			}).then(() => {
				// Update info about last visited campaign locally
				let userData = this.props.userDataContext.userData;
				userData.lastCampaignID = this.props.campaignID;
				userData.lastCampaignName = this.props.campaign.name;
				this.props.userDataContext.updateUserData(userData);
				console.log("Last visited campaign successfully updated!");
			}).catch((error) => {
				console.log("Error updating last visited campaign:", error);
			});
		}
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
					className="text-center campaign-item transition-border"
				>
					<Link to={{
						pathname: "/campaigns/"+ this.props.campaignID,
						state: {
							campaign: this.props.campaign,
							id: this.props.campaignID,
							activeTab: this.props.campaign.activeTab,
						}}}
						onClick={() => this.updateLastVisitedCampaign()}
					>
						<Card.Header>
							<Row>
								<Col xs="2" sm="1">
									<CampaignSharing
										campaignID = {this.props.campaignID}
										campaign = {this.props.campaign}
										campaigns = {this.props.campaigns}
										handleCampaigns = {this.props.handleCampaigns}
										campaignsRef = {this.props.campaignsRef}
										handleError = {this.props.handleError}
									/>
								</Col>
								<Col xs="8" sm="10" className="text-muted">
									{this.props.campaign.world}
								</Col>
								<Col xs="2" sm="1" className="center item-menu item-menu-c-item">
									<ItemMenu
										edit = {() => this.setState({ showCampaignInfo: true})}
										delete = {this.deleteCampaign}
										deleteText = {deleteText}
									/>
								</Col>
							</Row>
						</Card.Header>
						<Card.Body>
							<Card.Title>{this.props.campaign.name}</Card.Title>
							<Card.Text className="with-line-breaks regular-text">{description}</Card.Text>
						</Card.Body>
						<Card.Footer className="text-muted">{lastSession}</Card.Footer>
					</Link>
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
					userDataContext = {this.props.userDataContext}
					handleError = {this.props.handleError}
				/>
			</>
		);
	}
}

export default withFirebase(CampaignItem)