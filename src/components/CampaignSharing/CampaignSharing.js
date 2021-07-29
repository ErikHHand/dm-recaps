import React, { Component } from 'react';

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

import UserSearch from '../UserSearch/UserSearch';

import { COLOURS } from '../../constants/colours.js';
import { TEXTCOLOURS } from '../../constants/colours.js';

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove


/*
	Component for campaign sharing
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

	// This function is called when changing visibility of the tag selection pop-up
	// and the tag info component for adding new tags
	changeWindow() {
		this.setState({
			showCampaignSharing: !this.state.showCampaignSharing,
		});
	}

    changeCampaignSharingStatus(checked) {

        // Change campaign sharing status locally
        let campaigns = this.props.campaigns;
        campaigns[this.props.campaignID].sharingIsOn = checked;
        this.props.handleCampaigns(campaigns);

       // Edit campaign document on Firestore
        this.props.campaignsRef.doc(this.props.campaignID).update({
            sharingIsOn: checked,
        }).then(() => {
            console.log("Document successfully updated!");
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }

	removeUser(userID) {
		console.log("Remove user")

		// Change campaign sharing status locally
        let campaigns = this.props.campaigns;
        delete campaigns[this.props.campaignID].usersSharedWith[userID];
        this.props.handleCampaigns(campaigns);

       // Edit campaign document on Firestore
        this.props.campaignsRef.doc(this.props.campaignID).update({
			userLastHandled: userID,
            ["usersSharedWith." + userID]: firebase.firestore.FieldValue.delete(),
			usersSharedWithList: firebase.firestore.FieldValue.arrayRemove(userID)
        }).then(() => {
            console.log("Document successfully updated!");
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
	}

	render() {

        let campaignSharing = this;
		let usersSharedWith = <></>;

		let usersList = Object.keys(this.props.campaign.usersSharedWith);
		let coloursList = Object.values(COLOURS);
		let textColoursList = Object.values(TEXTCOLOURS);

		let userIsOwner = this.props.firebase.auth.currentUser.uid === this.props.campaign.ownerID;

		if(usersList && usersList.length !== 0) {
			usersSharedWith = usersList.map((userID) =>
				<Row key={userID}>
					<Col xs="6" className={this.props.campaign.sharingIsOn ? "center-vertically" : "center-vertically opacity-20"}>
						<Badge 
							pill 
							style={{ backgroundColor: coloursList[usersList.indexOf(userID)]}} 
							className={textColoursList[usersList.indexOf(userID)] + " user-tag"}
						>
							<FontAwesomeIcon icon={faUser} />
							&nbsp;
							{this.props.campaign.usersSharedWith[userID]}
						</Badge>
					</Col>
					<Col xs="4" className={this.props.campaign.sharingIsOn ? "user-access-type" : "user-access-type opacity-20"}>
						Write access
					</Col>
					<Col xs="2" className="center-vertically">
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
			<div>
                <div 
                    onClick={() => this.setState({ showCampaignSharing: !this.state.showCampaignSharing })}
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
					{({
						show: _show,
						...props
					}) => (
						<Popover id="popover-basic" {...props} className="campaign-sharing-window">
							<Popover.Title>
								<Row>
									<Col xs="8" className="campaign-sharing-title">
                                        Campaign Sharing
									</Col>
                                    <Col xs="4" className="right-align">
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
							</Popover.Title>
							<Popover.Content>
								{
									userIsOwner ?
									<UserSearch
										campaignID = {this.props.campaignID}
										campaign = {this.props.campaign}
										campaigns = {this.props.campaigns}
										handleCampaigns = {this.props.handleCampaigns}
										campaignsRef = {this.props.campaignsRef}
									/> :
									<></>
								}
								<div className="user-list">
									<Row>
										<Col xs="6" className="center-vertically">
											<Badge 
												pill 
												style={{ backgroundColor: coloursList[15]}} 
												className={textColoursList[15] + " user-tag"}
											>
												<FontAwesomeIcon icon={faUser} />
												&nbsp;
												{this.props.campaign.ownerUsername}
											</Badge>
										</Col>
										<Col xs="4" className="user-access-type">
											Owner
										</Col>
										<Col xs="2" className="center-vertically">
										</Col>
									</Row>
									{usersSharedWith}
								</div>
							</Popover.Content>
						</Popover>
					)}
				</Overlay>
			</div>
		)
	}
}

export default withFirebase(CampaignSharing)