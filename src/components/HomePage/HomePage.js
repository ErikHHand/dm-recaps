import React, { Component } from 'react';
import { withAuthorization } from '../Session/Session';

import NewCampaign from '../NewCampaign/NewCampaign';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';

class HomePage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			campaigns: [],
			showAddWindow: false,
		}

		this.handleCampaigns = this.handleCampaigns.bind(this);
	}

	componentDidMount() {

		let home = this;

        // Query for getting the wishlist collection from firestore
        let campaignsRef = this.props.firebase.db.collection("users")
        .doc(this.props.firebase.auth.currentUser.uid).collection("campaigns");

        campaignsRef.get().then((querySnapshot) => {
            let campaigns = {};

            // Get all entries in the wishlist collection
            querySnapshot.forEach((doc) => {
                campaigns[doc.id] = doc.data();
            });

            home.setState({
                campaigns: campaigns,
			});
			
			console.log("Campagins: ", campaigns);
			
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
	}

	handleCampaigns(campaigns) {
		this.setState({
			campaigns: campaigns,
		})
	}

	render() {
		
		let campaigns = Array.from(Object.keys(this.state.campaigns)).map((campaignID)=>
			<li key={campaignID}>{this.state.campaigns[campaignID].name}</li>
		);

		return (
			<Jumbotron fluid className="container">
				<h1 className="center">Campaigns</h1>
				<ul>{campaigns}</ul>
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