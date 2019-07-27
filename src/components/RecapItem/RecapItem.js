import React, { Component } from 'react';

import ItemMenu from '../ItemMenu/ItemMenu';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import Overlay from 'react-bootstrap/Overlay'
import Popover from 'react-bootstrap/Popover'
import { Form, Button } from 'react-bootstrap';

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Ta inte bort


class RecapItem extends Component {

	constructor(props) {
		super(props);

		this.attachRef = target => this.setState({ target });

		this.state = {
			tags: {},
			showTagOverlay: false,
			edit: false,
		}

		this.deleteRecap = this.deleteRecap.bind(this);
		this.editRecap = this.editRecap.bind(this);
	}

	componentDidMount() {
		
		let tags = {};
		for (let tag in this.props.campaign.tags) {
			tags[tag] = this.props.recapItem.tags.includes(tag);			
		}

		this.setState({
			tags: tags,
			showTagOverlay: false,
			text: this.props.recapItem.text,
		});		
	}

	onSubmit = event => {

		event.preventDefault();

		this.setState({
			showTagOverlay: false,
			edit: false,
		});

		let previousTags = this.props.recapItem.tags;
		let id = this.props.recapID;
		
		let tags = [];
		for (let tag in this.state.tags) {
			if(this.state.tags[tag]){
				tags.push(tag)
			}	
		}	
		let text = this.state.text;
		
		// Update recap Item

		let recapItem = this.props.recapItem;
		recapItem.tags = tags;
		recapItem.text = text;
		
		
		// Add locally to sessions
		
		let sessions = this.props.sessions;
		sessions[recapItem.session].recaps[this.props.recapID] = recapItem
		this.props.handleSessions(sessions);

		// Add to Firestore Sessions
		
		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).collection("sessions")
		.doc(recapItem.session).update({
			['recaps.' + id]: recapItem,
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});

		// Add locally to tags and to Firestore
		let tagsCollection = this.props.tags;
		
		for (let tag in this.state.tags) {

			if(this.state.tags[tag]){
				
				tagsCollection[tag].recaps[id] = recapItem;
				this.props.handleTags(tagsCollection);
				
				// Add to Firestore Tags
				
				this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
				.collection("campaigns").doc(this.props.id).collection("tags")
				.doc(tag).update({
					['recaps.' + id]: recapItem,
				})
				.then(function() {
					console.log("Document successfully updated!");
				}).catch(function(error) {
					console.log("Error getting document:", error);
				});
			}
			else if(!this.state.tags[tag] && previousTags.includes(tag)) {

				delete tagsCollection[tag].recaps[id];
				this.props.handleTags(tagsCollection);

				this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
				.collection("campaigns").doc(this.props.id).collection("tags")
				.doc(tag).update({
					['recaps.' + id]: firebase.firestore.FieldValue.delete(),
				})
				.then(function() {
					console.log("Document successfully deleted!");
				}).catch(function(error) {
					console.log("Error deleting field:", error);
				});
			}	
		}
	};

	onChangeText = event => {
		this.setState({ text: event.target.value });
	};

	onChange = event => {
    	let tags = this.state.tags;
		tags[event.target.name] = event.target.checked;

		this.setState({
			tags: tags,
		});
	};

	editRecap() {
		this.setState({
			edit: true,
		});
	}
	  
	deleteRecap() {

		// Delete recap in Recap order

		let campaign = this.props.campaign;
		console.log(campaign.sessions[this.props.recapItem.session].recapOrder);
		console.log(this.props.recapID);
		
		let index = campaign.sessions[this.props.recapItem.session].recapOrder.indexOf(this.props.recapID);
		console.log(index);
		if (index !== -1) campaign.sessions[this.props.recapItem.session].recapOrder.splice(index, 1);
		console.log(campaign.sessions[this.props.recapItem.session].recapOrder);
		this.props.handleCampaign(campaign);

		// Delete from Firestore Recap order
		
		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).update({
			['sessions.' + this.props.recapItem.session + '.recapOrder']: campaign.sessions[this.props.recapItem.session].recapOrder,
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});

		// Delete recap locally in session
		let sessions = this.props.sessions;
		delete sessions[this.props.recapItem.session].recaps[this.props.recapID];
		this.props.handleSessions(sessions);

		// Delete recap on Firestore sessions
		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).collection("sessions")
		.doc(this.props.recapItem.session).update({
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
			
			// Delete locally
			delete tags[tag].recaps[this.props.recapID];

			// Delete on firestore

			this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
			.collection("campaigns").doc(this.props.id).collection("tags")
			.doc(tag).update({
				["recaps." + this.props.recapID]: firebase.firestore.FieldValue.delete(),
			})
			.then(function() {
				console.log("Document successfully deleted!");
			}).catch(function(error) {
				console.log("Error deleting document:", error);
			});
		});

		this.props.handleTags(tags);

	}

	render() {

		const deleteText = {
			title: "Delete Recap",
			text: "Are you sure you want to delete this recap?"
		}

		const { showTagOverlay, target } = this.state;

		let recapItem = this;

		let editField = (
			<Form onSubmit={this.onSubmit} ref={f => this.form = f}>
				<Form.Group controlId="formEditRecap">
					<Form.Control 
						name="text"
						value={this.state.text}
						onKeyDown={(event) => {if(event.keyCode === 13) recapItem.form.dispatchEvent(new Event('submit'))}}
						onChange={this.onChangeText}
						type="text"
						as="textarea"
						autoFocus
					/>
				</Form.Group>
			</Form>
		);

		let selectTags = Array.from(Object.keys(this.props.campaign.tags)).map((tagID) => {
			return (
				<Form.Group id="formCheckbox" key={tagID} name={tagID}>
					<Form.Check 
						type="checkbox" 
						label={this.props.campaign.tags[tagID].name} 
						name={tagID} 
						checked={this.state.tags[tagID]} 
						onChange={this.onChange}
					/>
				</Form.Group>
			)
		});

		let tags = this.props.recapItem.tags.map((tagID) =>
			<Badge 
				pill 
				style={{ backgroundColor: this.props.campaign.tags[tagID].colour}} 
				key={this.props.recapItem.tags.indexOf(tagID)}
				className="text-white"
			>
				{this.props.campaign.tags[tagID].name}
			</Badge>
		);

		let date = new Date(this.props.campaign.sessions[this.props.recapItem.session].date.seconds * 1000)
		
		return (
			<Card onClick = {this.props.click}>
				<Card.Body className="recap-body">
					<Row>
						<Col>
						</Col>
						<Col xs="auto" className="session-info">
							{date.toDateString()}
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
						<Col>{this.state.edit ? editField : this.props.recapItem.text}</Col>
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