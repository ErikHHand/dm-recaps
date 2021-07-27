import React, { Component } from 'react';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Overlay from 'react-bootstrap/Overlay'
import Popover from 'react-bootstrap/Popover'
import Badge from 'react-bootstrap/Badge'

import BootstrapSwitchButton from 'bootstrap-switch-button-react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import UserSearch from '../UserSearch/UserSearch';


/*
	
*/
class CampaignSharing extends Component {

	constructor(props) {
		super(props);

        this.attachRef = target => this.setState({ target });

		this.state = {
			showCampaignSharing: false,
		}

		// Set the context for "this" for the following functions
		this.onSubmit = this.onSubmit.bind(this);
		this.onClick = this.onClick.bind(this);
		this.changeWindow = this.changeWindow.bind(this);
		this.changeCampaignSharingStatus = this.changeCampaignSharingStatus.bind(this);
	}

	// Triggers when changing tags
	// Updates tags for this recap item
	onClick(tagID) {
    	let tags = this.state.tags;
		tags[tagID] = !this.state.tags[tagID];

		this.setState({
			tags: tags,
		});
	};

	// This function is called when a user submits changes to
	// which tags are attached to the recap item
	onSubmit() {

		// Hide tag selection pop-up
		this.setState({
			showTagOverlay: false,
		})

		// Add tags with value True
		let tags = [];
		for (let tag in this.state.tags) {
			if(this.state.tags[tag]){
				tags.push(tag)
			}	
		}
		
		// Save previous tags to simplify removal of tags from the recap item
		let previousTags = this.props.recapItem.tags;

		// Update recap Item with potentially new text and tags
		let recapItem = this.props.recapItem;
		recapItem.tags = tags;
		this.props.writeRecap(recapItem, previousTags);
	};

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

	render() {

        let campaignSharing = this;

        /* 
        --- FRONTEND ---
            I NEED:
            - ***DONE*** A BUTON FOR TURNING ON SHARING
            - ***DONE*** A SEARCH WINDOW
            - AN OVERVIEW OF WHICH USERS HAVE ACCESS TO THE CAMPAIGN
			- A WAY TO REVOKE ACCESS FROM A USER

        --- BACKEND ---
            I NEED:
            - ***DONE*** A FIELD WITH BOOLEAN FOR IF SHARING IS TURNED ON
            - ***DONE*** LIST OF USERS WITH ACCESS
        */

		let usersSharedWith = <></>;

		let users = this.props.campaign.usersSharedWith;
		

		if(users && Object.keys(users).length !== 0) {
			console.log(this.props.campaign.usersSharedWith)
			usersSharedWith = Array.from(Object.keys(users)).map((userID) =>
				<Row key={userID}>
					<Col>
						<Badge 
							pill 
							className="recap-tag" 
						>
							<FontAwesomeIcon icon={faUser} />
							&nbsp;
							{this.props.campaign.usersSharedWith[userID]}
						</Badge>
					</Col>
					<Col>
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
								<UserSearch
									campaignID = {this.props.campaignID}
									campaign = {this.props.campaign}
									campaigns = {this.props.campaigns}
									handleCampaigns = {this.props.handleCampaigns}
									campaignsRef = {this.props.campaignsRef}
								/>
								{usersSharedWith}
							</Popover.Content>
						</Popover>
					)}
				</Overlay>
			</div>
		)
	}
}

export default CampaignSharing