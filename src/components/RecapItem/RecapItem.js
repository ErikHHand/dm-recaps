import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';
import RecapEditText from '../RecapEditText/RecapEditText';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import Overlay from 'react-bootstrap/Overlay'
import Popover from 'react-bootstrap/Popover'
import { Form, Button } from 'react-bootstrap';

import { COLOURS } from '../../constants/colours.js';
import { TEXTCOLOURS } from '../../constants/colours.js';
import { TYPES } from '../../constants/types.js';
import { ICONS } from '../../constants/types.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This component represents a recap item, the whole card with recap text
	and attached tags.
*/
class RecapItem extends Component {

	constructor(props) {
		super(props);

		// TODO: WTF does this line do??? Something with tag pop-up...
		this.attachRef = target => this.setState({ target });

		// WARNING: This creates a derived state! In this case I think that 
		// this is a logical solution
		let tags = {};
		for (let tag in this.props.campaign.tags) {
			tags[tag] = this.props.recapItem.tags.includes(tag);			
		}

		this.state = {
			tags: tags,
			showTagOverlay: false,
			edit: false,
		}

		// Set the context for "this" for the following functions
		this.deleteRecap = this.deleteRecap.bind(this);
		this.editRecap = this.editRecap.bind(this);
		this.writeRecap = this.writeRecap.bind(this);
	}

	// Triggers when an update to component happens
	// This is used to handle a change in number of tags
	// caused by deleting tags
	componentDidUpdate() {
		
		// Check if the number of tags has changed
		if(Object.keys(this.state.tags).length !== Object.keys(this.props.campaign.tags).length) {
			let tags = {};
			for (let tag in this.props.campaign.tags) {
				tags[tag] = this.props.recapItem.tags.includes(tag);			
			}

			this.setState({
				tags: tags,
			});
		}		
	}

	// Write recap
	// This function is called when adding a new recap
	// or editing recap data
	writeRecap(recapItem, previousTags) {

		// Close tag overlay and remove edit text area
		this.setState({
			showTagOverlay: false,
			edit: false,
		});

		let id = this.props.recapID;
		
		// Add locally to sessions
		let sessions = this.props.sessions;
		sessions[recapItem.session].recaps[this.props.recapID] = recapItem
		this.props.handleSessions(sessions);

		// Add to Firestore Sessions
		this.props.campaignRef.collection("sessions").doc(recapItem.session).update({
			['recaps.' + id]: recapItem,
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});

		// Add or delete locally and on Firestore
		let tagsCollection = this.props.tags;
		
		for (let tag in this.state.tags) {

			// If tag has been added
			if(this.state.tags[tag]){
				
				// Add locally to tags
				tagsCollection[tag].recaps[id] = recapItem;
				this.props.handleTags(tagsCollection);
				
				// Add to Firestore Tags
				this.props.campaignRef.collection("tags").doc(tag).update({
					['recaps.' + id]: recapItem,
				})
				.then(function() {
					console.log("Document successfully updated!");
				}).catch(function(error) {
					console.log("Error getting document:", error);
				});
			}

			// If tag has been removed
			else if(!this.state.tags[tag] && previousTags.includes(tag)) {

				// Delete locally and from Firestore
				this.deleteFromTags(tag, tagsCollection)
			}	
		}
		this.props.handleTags(tagsCollection);
		
	}

	// TODO: Remove this when a new component for editing tags has been created
	// Edits the recap.
	// This function is called when changing tags or the recap text
	onSubmit = event => {

		event.preventDefault();
		
		// Add tags with value True
		let tags = [];
		for (let tag in this.state.tags) {
			if(this.state.tags[tag]){
				tags.push(tag)
			}	
		}
		
		let previousTags = this.props.recapItem.tags;

		// Update recap Item with potentially new text and tags
		let recapItem = this.props.recapItem;
		recapItem.tags = tags;
		
		this.writeRecap(recapItem, previousTags);
	};

	// Triggers when changing tags
	// Updates tags for this recap item
	onChangeTags = event => {
    	let tags = this.state.tags;
		tags[event.target.name] = event.target.checked;

		this.setState({
			tags: tags,
		});
	};

	// Delete recap item from tags collection, both locally and on Firestore
	deleteFromTags(tag, tags) {

		// Delete locally from tags
		delete tags[tag].recaps[this.props.recapID];

		// Delete from Firestore Tags
		this.props.campaignRef.collection("tags").doc(tag).update({
			['recaps.' + this.props.recapID]: firebase.firestore.FieldValue.delete(),
		})
		.then(function() {
			console.log("Document successfully deleted!");
		}).catch(function(error) {
			console.log("Error deleting field:", error);
		});
	}

	editRecap() {
		this.setState({
			edit: true,
		});
	}
	  
	deleteRecap() {

		let session = this.props.recapItem.session;

		// Delete recap in Recap order
		let campaign = this.props.campaign;
		
		let index = campaign.sessions[session].recapOrder.indexOf(this.props.recapID);
		if (index !== -1) campaign.sessions[session].recapOrder.splice(index, 1);

		this.props.handleCampaign(campaign);

		// Delete from Firestore Recap order
		this.props.campaignRef.update({
			['sessions.' + session + '.recapOrder']: campaign.sessions[session].recapOrder,
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});

		// Delete recap locally in session
		let sessions = this.props.sessions;
		delete sessions[session].recaps[this.props.recapID];
		this.props.handleSessions(sessions);

		// Delete recap on Firestore sessions
		this.props.campaignRef.collection("sessions").doc(session).update({
			['recaps.' + this.props.recapID]: firebase.firestore.FieldValue.delete(),
		})
		.then(function() {
			console.log("Document successfully deleted!");
		}).catch(function(error) {
			console.log("Error deleting document:", error);
		});


		// Delete recaps from tags locally and on firestore
		let tags = this.props.tags;

		this.props.recapItem.tags.forEach(tag => {
			this.deleteFromTags(tag, tags)
		});

		this.props.handleTags(tags);
	}

	render() {

		// Text for recap item deletion
		const deleteText = {
			title: "Delete Recap",
			text: "Are you sure you want to delete this recap?"
		}

		const { showTagOverlay, target } = this.state;

		let recapItem = this;

		// The tags for the overlay where you select what tags to tag the recap with
		let selectTags = Array.from(Object.keys(this.props.campaign.tags)).map((tagID) => {
			return (
				<Form.Group id="formCheckbox" key={tagID} name={tagID}>
					<Form.Check 
						type="checkbox" 
						label={this.props.campaign.tags[tagID].name} 
						name={tagID} 
						checked={this.state.tags[tagID]} 
						onChange={this.onChangeTags}
					/>
				</Form.Group>
			)
		});

		// The tags currently attached to this recap
		let tags = this.props.recapItem.tags.map((tagID) =>
			<Badge 
				pill 
				style={{ backgroundColor: COLOURS[this.props.campaign.tags[tagID].colour]}} 
				key={this.props.recapItem.tags.indexOf(tagID)}
				className={TEXTCOLOURS[this.props.campaign.tags[tagID].colour]}
			>
				<FontAwesomeIcon icon={ICONS[this.props.campaign.tags[tagID].type]} />
				&nbsp;
				{this.props.campaign.tags[tagID].name}
			</Badge>
		);

		let date = new Date(this.props.campaign.sessions[this.props.recapItem.session].date.seconds * 1000);

		// Create number for session order
		let number = "#" + (this.props.campaign.sessionOrder.length - 
			this.props.campaign.sessionOrder.indexOf(this.props.recapItem.session)) + " ";
		
		return (
			<Card onClick = {this.props.click}>
				<Card.Body className="recap-body">
					<Row>
						<Col></Col>
						<Col xs="auto" className="session-info-text">
							{number + date.toDateString()}
							&emsp;
							{this.props.campaign.sessions[this.props.recapItem.session].description}
						</Col>
						<Col xs="1">
							<ItemMenu
								edit = {this.editRecap}
								delete = {this.deleteRecap}
								deleteText = {deleteText}
							/>
						</Col>
					</Row>
					<Row>
						<Col>
							{this.state.edit ? 
								<RecapEditText
									recapItem = {this.props.recapItem}
									writeRecap = {this.writeRecap}
								/> : 
								<p className="recap-text">{this.props.recapItem.text}</p>
							}
						</Col>
					</Row>
					<Row>
						<Col>
							<div className="right-align">
								{tags}
								<Badge 
									pill 
									variant="light" 
									className="add-tag" 
									onClick={() => this.setState({ showTagOverlay: !showTagOverlay })}
									ref={this.attachRef}
								>
									+
								</Badge>
								<Overlay 
									target={target} 
									show={showTagOverlay ? true : false} 
									placement="left" 
									rootClose={true}
									onHide={() => recapItem.setState({showTagOverlay: false})}
								>
									{({
										show: _show,
										...props
									}) => (
										<Popover id="popover-basic" title="Choose tags" {...props}>
											<Form onSubmit={this.onSubmit}>
												{selectTags}
												<Button variant="secondary" type="submit">Done</Button>
											</Form>
										</Popover>
									)}
								</Overlay>
							</div>
						</Col>
					</Row>
				</Card.Body>
			</Card>
		)
	}
}

export default withFirebase(RecapItem)