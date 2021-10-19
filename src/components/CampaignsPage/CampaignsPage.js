import React, { Component } from 'react';

import CampaignInfo from '../CampaignInfo/CampaignInfo';
import CampaignItem from '../CampaignItem/CampaignItem';

import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { withAuthorization } from '../Session/Session';

/*
	This component holds the page with the campaign list, the first page a 
	users sees when logging in.
*/
class CampaignsPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			status: "LOADING",
			campaigns: [],
			showCampaignInfo: false,
			campaignID: null,
			campaign: {name: "", description: "", world: "", setting: ""},
			showAlert: false,
			error: null,
			errorMessage: "",
		};

		// Set the context for "this" for the following functions
		this.handleCampaigns = this.handleCampaigns.bind(this);
		this.handleError = this.handleError.bind(this);
	}

	componentDidMount() {

		let home = this;

		// Reference for the campaigns collection on firestore
        let campaignsRef = this.props.firebase.db.collection("campaigns");

		// First get campaigns owned by the user, then get campaigns shared with the user
        campaignsRef.where("ownerID", "==", this.props.firebase.auth.currentUser.uid).get()
		.then((ownedCampaigns) => {
			campaignsRef.where("usersSharedWithList", "array-contains", this.props.firebase.auth.currentUser.uid)
			.where("sharingIsOn", "==", true).get()
			.then((sharedWithCampaigns) => {

				let campaigns = {};

				// Add campaigns owned by user to campaigns object
				ownedCampaigns.forEach((doc) => {
					campaigns[doc.id] = doc.data();
				});

				// Add campaigns shared with user to campaigns object
				sharedWithCampaigns.forEach((doc) => {
					campaigns[doc.id] = doc.data();
				});
				
				// Save the campaigns in the state
				home.setState({
					campaigns: campaigns,
					status: "LOADED",
				});
			}).catch((error) => {

				// Case when there are no campaigns shared with user
				console.log("Error getting document:", error);
				console.log("No campaigns shared with user");
				let campaigns = {};

				// Add campaigns owned by user to campaigns object
				ownedCampaigns.forEach((doc) => {
					campaigns[doc.id] = doc.data();
				});
				
				// Save the campaigns in the state
				home.setState({
					campaigns: campaigns,
					status: "LOADED",
				});
			});			
        }).catch((error) => {
            console.log("Error getting campaigns:", error);
			this.handleError(error, "Could not load campaigns")
			home.setState({
				status: "ERROR",
			});
        });
	}

	// Handles changes to the campaign list
	handleCampaigns(campaigns) {
		this.setState({
			campaigns: campaigns,
		});
	}

	// Handles saving errors to state for displaying
	handleError(error, errorMessage) {
		this.setState({
			error: error,
			errorMessage: errorMessage,
			showAlert: true,
		});
	}

	render() {

		let campaigns = <></>;;
		let unverifiedAccountAlert = <></>;;

		let currentUser = this.props.firebase.auth.currentUser;
		let campaignsRef = this.props.firebase.db.collection("campaigns");

		let timeSinceAccountCreation = (Date.now() - Date.parse(currentUser.metadata.creationTime));
	
		// Render an alert depending on whether of not the user has verified the email for this account
		if(timeSinceAccountCreation < 86400000 || currentUser.emailVerified) {
			unverifiedAccountAlert = <></>;
		} else if (timeSinceAccountCreation < 1209600000) {
			unverifiedAccountAlert = 
				<Alert variant="info">
					Remember to verify the email for this account!  &nbsp;
					<Alert.Link onClick={() => currentUser.sendEmailVerification()}>
						Send verification email again
					</Alert.Link>
				</Alert>
		} else {
			unverifiedAccountAlert = 
				<Alert variant="danger">
					WARNING! You have not yet verified the email for this account! 
					This account could be deleted if it is not verified soon! &nbsp;
					<Alert.Link onClick={() => currentUser.sendEmailVerification()}>
						Send verification email again
					</Alert.Link>
				</Alert>
		}

		switch (this.state.status) {
			case "LOADING":
				// Create spinner
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
						handleError = {this.handleError}
					/>
				);
				break;
			default:
				campaigns = <></>
				break;
		}
		
		return (
			<>
				<Alert
					dismissible
					show={this.state.showAlert}
					onClose={() => this.setState({showAlert: false,})}
					variant="danger"
				>
					{this.state.error && <div>{this.state.errorMessage + ": " + this.state.error.message}</div>}
				</Alert>
				<div 
					className="campaign-list remove-scroll-bar" 
					style={this.state.showAlert ? {maxHeight: "calc(96.5vh - 126px)"} : {}}
				>
					{unverifiedAccountAlert}
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
					handleError = {this.handleError}
				/>
			</>
		);
	}
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(CampaignsPage);