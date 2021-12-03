import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';
import TagInfo from '../TagInfo/TagInfo';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { COLOURSRGB } from '../../constants/colours.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This class holds the tag description on the right, top side of the tags page,
	above the recap item list. It also holds the function for deleting tags.
*/
class TagDescription extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showTagInfo: false,
			collapsed: false,
		};

		// Set the context for "this" for the following function
		this.deleteTag = this.deleteTag.bind(this);
		this.handleCollapse = this.handleCollapse.bind(this);
	}

	// Triggers when deleting a tag
	deleteTag(attempted) {

		let sessions = this.props.sessions;
		let tags = this.props.tags;
		let tagRecaps = this.props.tags[this.props.tagID].recaps
		let campaign = this.props.campaign;

		// Iterate over all recap items this tag is attached to
		if(!attempted) {
			for(let recapID in tagRecaps) {

				let recapItem = this.props.tags[this.props.tagID].recaps[recapID];
				let tagIndex = recapItem.tags.indexOf(this.props.tagID);
	
				// Remove tag from recap item and re-add the recap item without the tag
				if (tagIndex !== -1) recapItem.tags.splice(tagIndex, 1);
				sessions[recapItem.session].recaps[recapID] = recapItem;
	
				// Update recap in recaps collection on Firestore
				this.props.campaignRef.collection("recaps").doc(recapID).update(recapItem)
				.then(() => {
					console.log("Recap successfully updated!");
				}).catch((error) => {
					console.log("Error updating recap:", error);
				});
			}
			this.props.handleSessions(sessions);
		}

		// Delete tag info on Firestore
		this.props.campaignRef.update({
			operation: "tag-delete",
			["tags." + this.props.tagID]: firebase.firestore.FieldValue.delete(),
			selectedTag: this.props.tagID,
			numberOfKeys: Object.keys(campaign.tags).length - 1,
		}).then(() => {
			console.log("Tag successfully deleted!");

			// Set current tag to null
			this.props.handleSelectedTag(null);

			// Delete tag from filtered Tags array
			let filteredTags = this.props.filteredTags;
			let index = filteredTags.indexOf(this.props.tagID);
			if(index !== -1) filteredTags.splice(index, 1);
			this.props.handleFilteredTags(filteredTags);

			// Delete tag info locally
			delete campaign.tags[this.props.tagID];
			this.props.handleCampaign(campaign);

			// Delete tag with recaps locally
			delete tags[this.props.tagID];
			this.props.handleTags(tags);

			// Set selected tag to empty string on Firestore
			this.props.campaignRef.update({
				operation: "selected-tag-update",
				selectedTag: "",
			}).then(() => {
				console.log("Successfully updated selected tag!");
			}).catch((error) => {
				console.log("Error updating selected tag:", error);
			});
		}).catch((error) => {
			console.log("Error deleting tag:", error);
			if(attempted) {
				this.props.handleError(error, "Could not delete tag")
			} else {
				console.log("Reading and reattempting");
				this.props.loadCampaign(
					() => {this.deleteTag(true)}
				);
			}
		});
	}

	// Function that handles collapsing and expanding the tag description
	handleCollapse() {
		this.setState({collapsed: !this.state.collapsed});
	}

	render() {

		const deleteText = {
			title: "Delete Tag",
			text: "Are you sure you want to delete this tag and remove it from all recaps?"
		}

		// Placeholder description
		let noDescription = "This tag has no description";

		// Create background colour for the description box
		let background = {backgroundColor: COLOURSRGB[this.props.tag.colour]}

		// Vary chevron, classes and tag description text based on of the tag description
		// is collapsed or not
		let chevron = this.state.collapsed ? faChevronDown : faChevronUp;
		let tagDescriptionCardTitleClass = this.state.collapsed ? "tag-description-card-title" : "";
		let tagDescriptionTitleClass = this.state.collapsed ? 
			"tag-description-title-collapsed tag-description-title" : "tag-description-title";
		let tagDescriptionText = this.state.collapsed ? <></> :
			<Card.Text className="with-line-breaks regular-text">
				{this.props.tag.description ? this.props.tag.description : noDescription}
			</Card.Text>

		return (
			<>
				<Card className="tag-description" style={background}>
					<Card.Body>
						<Card.Title className={tagDescriptionCardTitleClass}>
							<Row>
								<Col md="11" xs="10">
									<div className={tagDescriptionTitleClass}>
										{this.props.tag.name}
									</div>
									<div className="tag-description-chevron icon">
										<FontAwesomeIcon 
											icon={chevron}
											onClick={() => {
												this.handleCollapse();
												this.props.updateDimension();
											}}
										/>
									</div>
								</Col>
								<Col md="1" xs="2" className="right-align item-menu">
									<ItemMenu
										edit = {() => this.setState({ showTagInfo: true})}
										delete = {() => this.deleteTag(false)}
										deleteText = {deleteText}
									/>
								</Col>
							</Row>
						</Card.Title>
						{tagDescriptionText}
					</Card.Body>
				</Card>
				<TagInfo 
					show = {this.state.showTagInfo}
					onHide = {() => this.setState({ showTagInfo: false })}
					tags = {this.props.tags}
					campaign = {this.props.campaign}
					handleTags = {this.props.handleTags}
					handleCampaign = {this.props.handleCampaign}
					campaignRef = {this.props.campaignRef}
					edit = {true}
					tagID = {this.props.tagID}
					tag = {this.props.tag}
					handleSelectedTag = {this.props.handleSelectedTag}
					handleError = {this.props.handleError}
					loadCampaign = {this.props.loadCampaign}
				/>
			</>
		);
	}
}

export default withFirebase(TagDescription)