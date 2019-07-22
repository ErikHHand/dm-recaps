import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';
import TagInfo from '../TagInfo/TagInfo';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

class TagItem extends Component {

	constructor(props) {
		super(props);

		this.deleteTag = this.deleteTag.bind(this);
		this.editTag = this.editTag.bind(this);

		this.state = {
			showEditWindow: false,
		}
	}

	editTag() {
		this.setState({
			showEditWindow: true,
		});
	}

	deleteTag() {

		// Set current tag to null
		this.props.handleCurrentTag(null);

		// Delete tag in session recaps locally and on Firestore
		let sessions = this.props.sessions;

		for(let recapID in this.props.tags[this.props.tagID].recaps) {

			let recapItem = this.props.tags[this.props.tagID].recaps[recapID];
			let tagIndex = recapItem.tags.indexOf(this.props.tagID);

			if (tagIndex !== -1) recapItem.tags.splice(tagIndex, 1);
			sessions[recapItem.session].recaps[recapID] = recapItem;

			this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
			.collection("campaigns").doc(this.props.id).collection("sessions")
			.doc(recapItem.session).update({
				["recaps." + recapID]: recapItem,
			}).then(function() {
				console.log("Document successfully deleted!");
			}).catch(function(error) {
				console.log("Error deleting document:", error);
			});

			recapItem.tags.forEach( tagID => {
				console.log(tagID);
				
				this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
				.collection("campaigns").doc(this.props.id).collection("tags")
				.doc(tagID).update({
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

		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).collection("tags")
		.doc(this.props.tagID).delete()
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

		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).update({
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
			text: "Are you sure you want to delete this session and remove it from all recaps?"
		}

		return (
			<>
				<Card 
					className="tag" 
					style={{ backgroundColor: this.props.tag.colour}}
					onClick = {this.props.handleClick}
				>
					<Card.Body>
						<Card.Subtitle>
							<Row>
								<Col xs="9">
								</Col>
								<Col xs="3" className="center">
									<ItemMenu
										edit = {this.editTag}
										delete = {this.deleteTag}
										deleteText = {deleteText}
									/>
								</Col>
							</Row>
						</Card.Subtitle>
						<Card.Text className="tag-text text-white">
							{this.props.tag.name}
						</Card.Text>
					</Card.Body>
				</Card>
				<TagInfo
					show = {this.state.showEditWindow}
					onHide = {() => this.setState({ showEditWindow: false })}
					sessions = {this.props.sessions}
					handleSessions = {this.props.handleSessions}
					campaign = {this.props.campaign}
					handleCampaign = {this.props.handleCampaign}
					id = {this.props.id}
					edit = {true}
					tag = {this.props.tag}
					tagID = {this.props.tagID}
				/>
			</>
		);
	}
}

export default withFirebase(TagItem)