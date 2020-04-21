import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This class holds the Tag Items on the left side of the Tags Page.
	This class holds the layout as well as the function for deleting
*/
class TagItem extends Component {

	constructor(props) {
		super(props);

		// Set the context for "this" for the following function
		this.deleteTag = this.deleteTag.bind(this);
	}

	// Triggers when deleting a tag
	deleteTag() {

		// Set current tag to null
		this.props.handleCurrentTag(null);

		// Delete tag in session recaps locally and on Firestore
		let sessions = this.props.sessions;

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

			// Add recap in tags (for each tag) on Firestore
			recapItem.tags.forEach( tagID => {
				console.log(tagID);
				
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
		let tags = this.props.tags;
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

		return (
			<>
				<Card 
					className="tag-item" 
					style={{ backgroundColor: this.props.tagInfo.colour}}
					border={this.props.isSelected ? "info" : "light"} 
					onClick = {this.props.handleClick}
				>
					<Card.Body>
						<Card.Title>
							<Row>
								<Col xs="9" className="tag-item-title text-white">
									{this.props.tagInfo.name}
								</Col>
								<Col xs="3" className="center">
									<ItemMenu
										edit = {() => this.props.editTag(
											this.props.tagID,
											this.props.tagInfo.name,
											this.props.tagInfo.type,
											this.props.tagInfo.colour
										)}
										delete = {this.deleteTag}
										deleteText = {deleteText}
									/>
								</Col>
							</Row>
						</Card.Title>
					</Card.Body>
				</Card>
			</>
		);
	}
}

export default withFirebase(TagItem)