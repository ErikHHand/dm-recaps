import React, { Component } from 'react';
import { withAuthorization } from '../Session/Session';

import CampaignInfo from '../CampaignInfo/CampaignInfo';

import { Link } from "react-router-dom";

import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';

/*
	This component holds the page with the campaign list, the first page a 
	users sees when logging in.
*/
class HomePage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			campaigns: [],
			campaignsRef: "",
			showCampaignInfo: false,
		};

		// Set the context for "this" for the following function
		this.handleCampaigns = this.handleCampaigns.bind(this);
	}

	componentDidMount() {

		let home = this;

        // Save the query reference for campaigns
        let campaignsRef = this.props.firebase.db.collection("users")
		.doc(this.props.firebase.auth.currentUser.uid).collection("campaigns");
		
		// Save the reference for the campaigns collection in the state
		this.setState({
			campaignsRef: campaignsRef,
		});

		// Query for getting the campaign collection from firestore
        campaignsRef.get().then((querySnapshot) => {
            let campaigns = {};

            // Get all entries in the campaign collection
            querySnapshot.forEach((doc) => {
                campaigns[doc.id] = doc.data();
            });

            home.setState({
                campaigns: campaigns,
			});
						
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
	}

	// Handles changes to the campaign list
	handleCampaigns(campaigns) {
		this.setState({
			campaigns: campaigns,
		})
	}

	render() {
		
		// Fill campaign list
		let campaigns = Array.from(Object.keys(this.state.campaigns)).map((campaignID)=>
			<Link key={campaignID} to={{
				pathname: "/campaigns/"+campaignID,
				state: {
					campaign: this.state.campaigns[campaignID],
					id: campaignID,
				}
			}}>
				<li>{this.state.campaigns[campaignID].name}</li>
			</Link>
		);

		return (
			<Jumbotron fluid className="container">
				<h1 className="center">Campaigns</h1>
				<ul>{campaigns}</ul>
				<div className="center">
					<Button variant="success" onClick={() => this.setState({ showCampaignInfo: true })}>Create a new campaign!</Button>
				</div>
				<CampaignInfo 
					show = {this.state.showCampaignInfo}
					onHide = {() => this.setState({ showCampaignInfo: false })}
					campaigns = {this.state.campaigns}
					handleCampaigns = {this.handleCampaigns}
					campaignsRef = {this.state.campaignsRef}
				/>
			</Jumbotron>
		)
	}
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(HomePage);