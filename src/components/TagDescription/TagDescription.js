import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';
import TagInfo from '../TagInfo/TagInfo';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { COLOURSRGB } from '../../constants/colours.js';

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
		};

		// Set the context for "this" for the following function
		this.deleteTag = this.deleteTag.bind(this);
	}

	// Triggers when deleting a tag
	deleteTag() {
	
		// Set current tag to null
		this.props.handleSelectedTag(null);

		// Delete tag in session recaps locally and on Firestore
		let sessions = this.props.sessions;
		let tags = this.props.tags;

		// Iterate over all recap items this tag is attached to
		for(let recapID in this.props.tags[this.props.tagID].recaps) {

			let recapItem = this.props.tags[this.props.tagID].recaps[recapID];
			let tagIndex = recapItem.tags.indexOf(this.props.tagID);

			if (tagIndex !== -1) recapItem.tags.splice(tagIndex, 1); // Remove tag from recap item
			sessions[recapItem.session].recaps[recapID] = recapItem; // Re-add the recap item without the tag

			// Add recap in sessions on Firestore
			this.props.campaignRef.collection("sessions").doc(recapItem.session).update({
				["recaps." + recapID]: recapItem,
			}).then(function() {
				console.log("Document successfully deleted!");
			}).catch(function(error) {
				console.log("Error deleting document:", error);
			});

			// Overwrite recap in tags on Firestore,
			// for every other attached tag
			recapItem.tags.forEach( tagID => {
				
				tags[tagID].recaps[recapID] = recapItem;

				this.props.campaignRef.collection("tags").doc(tagID).update({
					["recaps." + recapID]: recapItem,
				}).then(function() {
					console.log("Document successfully deleted!");
				}).catch(function(error) {
					console.log("Error deleting document:", error);
				});
			});
		}
		this.props.handleSessions(sessions);

		// Delete tag recaps locally
		delete tags[this.props.tagID];
		this.props.handleTags(tags);
		
		// Delete tag recaps on Firestore
		this.props.campaignRef.collection("tags").doc(this.props.tagID).delete()
		.then(function() {
			console.log("Document successfully deleted!");
		}).catch(function(error) {
			console.log("Error deleting document:", error);
		});

		// Delete tag info locally
		let campaign = this.props.campaign;
		delete campaign.tags[this.props.tagID];
		this.props.handleCampaign(campaign);

		// Delete tag from filtered Tags array
		let filteredTags = this.props.filteredTags;
		let index = filteredTags.indexOf(this.props.tagID);
		if(index !== -1) filteredTags.splice(index, 1);
		this.props.handleFilteredTags(filteredTags);

		// Delete tag info on Firestore
		this.props.campaignRef.update({
			["tags." + this.props.tagID]: firebase.firestore.FieldValue.delete(),
		})
		.then(function() {
			console.log("Document successfully deleted!");
		}).catch(function(error) {
			console.log("Error deleting document:", error);
		});
	}

	render() {	

		const deleteText = {
			title: "Delete Tag",
			text: "Are you sure you want to delete this tag and remove it from all recaps?"
		}

		let noDescription = "This tag has no description"; // Placeholder description

		// Create background colour for the description box
		let background = {backgroundColor: COLOURSRGB[this.props.tag.colour]}

		return (
			<>
				<Card className="tag-description" style={background}>
					<Card.Body>
						<Card.Title className="">
							<Row>
								<Col lg="11" md="10">{this.props.tag.name}</Col>
								<Col lg="1" md="2" className="right-align">
									<ItemMenu
										edit = {() => this.setState({ showTagInfo: true})}
										delete = {this.deleteTag}
										deleteText = {deleteText}
									/>
								</Col>
							</Row>
						</Card.Title>
						<Card.Text className="with-line-breaks regular-text">
							{this.props.tag.description ? this.props.tag.description : noDescription}
						</Card.Text>
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
				/>
			</>
		);
	}
}

export default withFirebase(TagDescription)