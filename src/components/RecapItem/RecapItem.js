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
		}
	}

	componentDidMount() {
		
		let tags = {};
		for (let tag in this.props.campaign.tags) {
			tags[tag] = this.props.recapItem.tags.includes(tag);			
		}

		this.setState({
			tags: tags,
			showTagOverlay: false,
		});		
	}

	onSubmit = event => {

		event.preventDefault();

		this.setState({
			showTagOverlay: false,
		});
		
		let tags = [];
		for (let tag in this.state.tags) {
			if(this.state.tags[tag]){
				tags.push(tag)
			}	
		}		
		
		let previousTags = this.props.recapItem.tags;
		
		// Add locally to sessions
		let recapItem = this.props.recapItem;
		let sessions = this.props.sessions;

		sessions[recapItem.session].recaps[this.props.recapID].tags = tags
		this.props.handleSessions(sessions);

		// Add to Firestore Sessions
		
		this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid)
		.collection("campaigns").doc(this.props.id).collection("sessions")
		.doc(recapItem.session).update({
			['recaps.' + this.props.recapID + '.tags']: tags,
		})
		.then(function() {
			console.log("Document successfully updated!");
		}).catch(function(error) {
			console.log("Error getting document:", error);
		});

		// Add locally to tags and to Firestore
		let tagsCollection = this.props.tags;
		recapItem.tags = tags;
		let id = this.props.recapID;
		
		for (let tag in this.state.tags) {

			if(this.state.tags[tag] && !previousTags.includes(tag)){
				
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

	onChange = event => {
    	let tags = this.state.tags;
		tags[event.target.name] = event.target.checked;

		this.setState({
			tags: tags,
		});
  	};

	render() {

		const { showTagOverlay, target } = this.state;

		let selectTags = Array.from(Object.keys(this.props.campaign.tags)).map((tagID) => {
			return (
				<Form.Group id="formCheckbox" key={tagID} name={tagID}>
					<Form.Check 
						type="checkbox" 
						label={this.props.campaign.tags[tagID].name} 
						name={tagID} 
						checked={this.state.tags[tagID]} 
						onChange={this.onChange}/>
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
		
		return (
			<Card onClick = {this.props.click}>
				<Card.Body className="recap-body">
					<Row>
						<Col>
						</Col>
						<Col xs="auto" className="session-info">
							
						</Col>
						<Col xs="1">
							<ItemMenu/>
						</Col>
					</Row>
					<Row>
						<Col>{this.props.recapItem.text}</Col>
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
								<Overlay target={target} show={showTagOverlay ? true : false} placement="right">
									{({
										placement,
										scheduleUpdate,
										arrowProps,
										outOfBoundaries,
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