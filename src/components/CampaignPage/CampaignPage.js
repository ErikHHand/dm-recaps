import React, { Component } from 'react';

import { withAuthorization } from '../Session/Session';
import CampaignInfo from '../CampaignInfo/CampaignInfo';
import CampaignItem from '../CampaignItem/CampaignItem';
import SignOutButton from '../SignOut/SignOut';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Spinner from 'react-bootstrap/Spinner'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

/*
	This component holds the page with the campaign list, the first page a 
	users sees when logging in.
*/
class CampaignPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			status: "LOADING",
			campaigns: [],
			showCampaignInfo: false,
			campaignID: null,
			campaign: {name: "", description: "", world: "", setting: ""},
		};

		// Set the context for "this" for the following function
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
				status: "LOADED",
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

		// Save the query reference for campaigns
        let campaignsRef = this.props.firebase.db.collection("users")
		.doc(this.props.firebase.auth.currentUser.uid).collection("campaigns");

		let campaigns = null;

		switch (this.state.status) {
			case "LOADING":
				campaigns = <div className="loading-spinner">
					<Spinner animation="grow" variant="info" role="status">
						<span className="sr-only">Loading...</span>
					</Spinner>
				</div>
				break;
			case "LOADED":
				// Fill campaign list
				campaigns = Array.from(Object.keys(this.state.campaigns)).map((campaignID)=>
					<CampaignItem
						key={campaignID}
						campaignID = {campaignID}
						campaign = {this.state.campaigns[campaignID]}
						campaigns = {this.state.campaigns}
						handleCampaigns = {this.handleCampaigns}
						campaignsRef = {campaignsRef}
					/>
				);
				break;
			default:
				campaigns = <p>Failed to load data, please reload the page or check your internet connection.</p>
				break;
		}
		
		
		return (
			<Container>				
				<Row className="top-bar">
					<Col md={10}>
					</Col>
					<Col md={2}>
						<SignOutButton/>	
					</Col>
				</Row>
				<div className="center campaign-title">Campaigns</div>
				<div className="campaign-list remove-scroll-bar border-top">
					<div 
						className="campaign-add-button item-add-button" 
						onClick={() => this.setState({showCampaignInfo: true})}
					>
						<FontAwesomeIcon icon={faPlus}/>
					</div>
					{campaigns}
				</div>

				<CampaignInfo 
					show = {this.state.showCampaignInfo}
					onHide = {() => this.setState({ showCampaignInfo: false })}
					campaigns = {this.state.campaigns}
					handleCampaigns = {this.handleCampaigns}
					campaignsRef = {campaignsRef}
					edit = {false}
					campaignID = {this.state.campaignID}
				/>
			</Container>
		);
	}
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(CampaignPage);