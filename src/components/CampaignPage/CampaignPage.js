import React, { Component } from 'react';

import { withAuthorization } from '../Session/Session';
import CampaignInfo from '../CampaignInfo/CampaignInfo';
import CampaignItem from '../CampaignItem/CampaignItem';
import SignOutButton from '../SignOut/SignOut';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'

/*
	This component holds the page with the campaign list, the first page a 
	users sees when logging in.
*/
class CampaignPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			campaigns: [],
			showCampaignInfo: false,
			edit: false,
			campaignID: null,
			campaign: {name: "", description: "", world: "", setting: ""},
		};

		// Set the context for "this" for the following functions
		this.addCampaign = this.addCampaign.bind(this);
		this.editCampaign = this.editCampaign.bind(this);
		this.handleCampaigns = this.handleCampaigns.bind(this);
	}

	componentDidMount() {

		let home = this;

		// Query for getting the campaign collection from firestore
        let campaignsRef = this.props.firebase.db.collection("users")
		.doc(this.props.firebase.auth.currentUser.uid).collection("campaigns");
        campaignsRef.get().then((querySnapshot) => {
            let campaigns = {};

            // Get all entries in the campaign collection
            querySnapshot.forEach((doc) => {
                campaigns[doc.id] = doc.data();
            });
			
			// Save the campaigns in the state
            home.setState({
                campaigns: campaigns,
			});
						
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
	}

	// Triggers when adding a campaign
	addCampaign() {
		this.setState({
			campaignID: null,
			edit: false,
			campaign: {name: "", description: "", world: "", setting: ""},
			showCampaignInfo: true,
		});
	}

	// Triggers before editing a campaign
	editCampaign(campaignID, campaign) {
		this.setState({
			campaignID: campaignID,
			campaign: campaign,
			edit: true,
			showCampaignInfo: true,
		});
	}

	// Handles changes to the campaign list
	handleCampaigns(campaigns) {
		this.setState({
			campaigns: campaigns,
		})
	}

	render() {

		// Save the query reference for campaigns
        let campaignsRef = this.props.firebase.db.collection("users")
		.doc(this.props.firebase.auth.currentUser.uid).collection("campaigns");
		
		// Fill campaign list
		let campaigns = Array.from(Object.keys(this.state.campaigns)).map((campaignID)=>
			<CampaignItem
				key={campaignID}
				campaignID = {campaignID}
				campaign = {this.state.campaigns[campaignID]}
				editCampaign = {this.editCampaign}
				campaigns = {this.state.campaigns}
				handleCampaigns = {this.handleCampaigns}
				campaignsRef = {campaignsRef}
			/>
		);

		return (
			<Container>
				<Row>
					<Col md={10}>
					</Col>
					<Col md={2}>
						<Navbar variant="dark">
							<SignOutButton/>	
						</Navbar>
					</Col>
				</Row>
				
				<Jumbotron fluid className="container">
					<h1 className="center">Campaigns</h1>
					<div className="campaign-list remove-scroll-bar border-top border-bottom">{campaigns}</div>
					<div className="center">
						<Button variant="success" onClick={this.addCampaign}>Create a new campaign!</Button>
					</div>
					<CampaignInfo 
						show = {this.state.showCampaignInfo}
						onHide = {() => this.setState({ showCampaignInfo: false })}
						campaigns = {this.state.campaigns}
						handleCampaigns = {this.handleCampaigns}
						campaignsRef = {campaignsRef}
						edit = {this.state.edit}
						campaignID = {this.state.campaignID}
						campaign = {this.state.campaign}
					/>
				</Jumbotron>
			</Container>
		);
	}
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(CampaignPage);