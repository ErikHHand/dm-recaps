import React, { Component } from 'react';

import UserSearch from '../UserSearch/UserSearch';

import { COLOURS } from '../../constants/colours.js';
import { TEXTCOLOURS } from '../../constants/colours.js';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Overlay from 'react-bootstrap/Overlay'
import Popover from 'react-bootstrap/Popover'
import Badge from 'react-bootstrap/Badge'
import CloseButton from 'react-bootstrap/CloseButton'

import BootstrapSwitchButton from 'bootstrap-switch-button-react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This component holds the window for sharing the campaign with other users.
	It handles turning campaign sharing on and off, showing which users have
	access to the campaign and revoking access for users.
*/
class CampaignSharing extends Component {

	constructor(props) {
		super(props);

        this.attachRef = target => this.setState({ target });

		this.state = {
			showCampaignSharing: false,
		}

		// Set the context for "this" for the following functions
		this.changeWindow = this.changeWindow.bind(this);
		this.changeCampaignSharingStatus = this.changeCampaignSharingStatus.bind(this);
		this.removeUser = this.removeUser.bind(this);
	}

	// This function is called when changing visibility for the campaign sharing window
	changeWindow() {
		this.setState({
			showCampaignSharing: !this.state.showCampaignSharing,
		});
	}

	// Handles turning campaign sharing on or off 
    changeCampaignSharingStatus(campaignSharingStatus) {

       // Change campaign sharing status on Firestore
        this.props.campaignsRef.doc(this.props.campaignID).update({
			operation: "sharing-change-status",
            sharingIsOn: campaignSharingStatus,
        }).then(() => {
            console.log("Sharing statue successfully changed!");

			// Change campaign sharing status locally
			let campaigns = this.props.campaigns;
			campaigns[this.props.campaignID].sharingIsOn = campaignSharingStatus;
			this.props.handleCampaigns(campaigns);
        }).catch((error) => {
            console.log("Could not change sharing status:", error);
			this.props.handleError(error, "Could not change campaign sharing")
        });
    }

	// Triggers when revoking access to a campaign for a user
	removeUser(userID) {

       // Remove user from campaign document on Firestore 
        this.props.campaignsRef.doc(this.props.campaignID).update({
			operation: "sharing-remove-user",
			userLastHandled: userID,
            ["usersSharedWith." + userID]: firebase.firestore.FieldValue.delete(),
			usersSharedWithList: firebase.firestore.FieldValue.arrayRemove(userID)
        }).then(() => {
            console.log("User successfully removed from sharing");

			// Revoke access locally
			let campaigns = this.props.campaigns;
			delete campaigns[this.props.campaignID].usersSharedWith[userID];
			const index = campaigns[this.props.campaignID].usersSharedWithList.indexOf(userID);
			if (index > -1) {campaigns[this.props.campaignID].usersSharedWithList.splice(index, 1);}
			this.props.handleCampaigns(campaigns);
        }).catch((error) => {
            console.log("Error removing user from sharing:", error);
			this.props.handleError(error, "Could not change campaign sharing")
        });
	}

	render() {

        let campaignSharing = this;
		let usersSharedWith = <></>;

		// Create lists from colour constans for user badges
		let coloursList = Object.values(COLOURS);
		let textColoursList = Object.values(TEXTCOLOURS);

		// List of users with access to this campaign
		let usersList = this.props.campaign.usersSharedWithList;

		// Set if user is owner or not
		let userIsOwner = false;
		if(this.props.firebase.auth.currentUser) {
			userIsOwner = this.props.firebase.auth.currentUser.uid === this.props.campaign.ownerID;
		}
		
		// Create rows for any users with access to this campaign, showing
		// username, what type of access a user has, and if a user is owner
		// an option for revoking access to campaign
		if(usersList && usersList.length !== 0) {
			usersSharedWith = usersList.map((userID) =>
				<Row key={userID} className="remove-margin">
					<Col 
						xs="6" 
						className={this.props.campaign.sharingIsOn ? 
							"center-vertically remove-padding" : 
							"center-vertically remove-padding opacity-20"
						}
					>
						<Badge 
							pill 
							style={{ backgroundColor: coloursList[usersList.indexOf(userID)]}} 
							className={textColoursList[usersList.indexOf(userID)] + " user-tag tag tag-not-clickable"}
							bg="bullshit"
						>
							<FontAwesomeIcon icon={faUser} />
							&nbsp;
							{this.props.campaign.usersSharedWith[userID]}
						</Badge>
					</Col>
					<Col xs="4" className={this.props.campaign.sharingIsOn ? 
						"text-grey-italic center-vertically remove-padding" : 
						"text-grey-italic center-vertically remove-padding opacity-20"
						}
					>
						Write access
					</Col>
					<Col xs="2" className="center-vertically remove-padding">
						{
							userIsOwner ?
							<CloseButton
								className="user-sharing-remove"
								onClick={() => this.removeUser(userID)}
							/> :
							<></>
						}
					</Col>
				</Row>
			);
		}

		return (
			<>
                <div 
                    onClick={(event) => {
						event.stopPropagation();
						event.preventDefault();
						this.setState({ showCampaignSharing: !this.state.showCampaignSharing });
					}}
                    ref={this.attachRef}
                >
                    <FontAwesomeIcon 
                        icon={faUserFriends}
                        className={this.props.campaign.sharingIsOn ? "campaign-sharing-icon-on" : "icon"}
                    />
                </div>
				<Overlay 
					target={this.state.target} 
					show={this.state.showCampaignSharing ? true : false} 
					placement="right" 
					rootClose={true}
					onHide={() => campaignSharing.setState({showCampaignSharing: false})}
				>
					{({ show: _show,...props }) => (
						<Popover 
							id="popover-basic" 
							{...props} 
							className="campaign-sharing-window" 
							onClick={(event) => {
								event.stopPropagation();
								event.preventDefault();
							}}
						>
							<Popover.Header>
								<Row className="remove-margin">
									<Col xs="8" className="campaign-sharing-title remove-padding">
                                        Campaign Sharing
									</Col>
                                    <Col xs="4" className="right-align remove-padding">
                                        <BootstrapSwitchButton
											disabled={!userIsOwner}
                                            checked={this.props.campaign.sharingIsOn}
                                            onstyle="info"
                                            offstyle="outline-info"
                                            width={65} height={29}
                                            onChange={(checked) => {this.changeCampaignSharingStatus(checked)}}
                                        />
                                    </Col>
								</Row>
							</Popover.Header>
							<Popover.Body>
								{
									userIsOwner ?
									<UserSearch
										campaignID = {this.props.campaignID}
										campaign = {this.props.campaign}
										campaigns = {this.props.campaigns}
										handleCampaigns = {this.props.handleCampaigns}
										handleError = {this.props.handleError}
										campaignsRef = {this.props.campaignsRef}
									/> :
									<></>
								}
								<div className="user-list">
									<Row className="remove-margin">
										<Col className="user-maximum-text text-grey-italic">
											Campaigns can be shared between 16 people at most.
										</Col>
									</Row>
									<Row className="remove-margin">
										<Col xs="6" className="center-vertically p-0">
											<Badge 
												pill 
												style={{ backgroundColor: coloursList[15]}} 
												className={textColoursList[15] + " user-tag tag tag-not-clickable"}
												bg="bullshit"
											>
												<FontAwesomeIcon icon={faUser} />
												&nbsp;
												{this.props.campaign.ownerUsername}
											</Badge>
										</Col>
										<Col xs="4" className="text-grey-italic center-vertically p-0">
											Owner
										</Col>
										<Col xs="2" className="center-vertically p-0">
										</Col>
									</Row>
									{usersSharedWith}
								</div>
							</Popover.Body>
						</Popover>
					)}
				</Overlay>
			</>
		)
	}
}

export default withFirebase(CampaignSharing)