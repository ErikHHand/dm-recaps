import React, { Component } from 'react';

import Modal from 'react-bootstrap/Modal'
import { Form, Button } from 'react-bootstrap';

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase';

/*
	This component holds the pop-up window for editing campaign info,
	when adding or editing a campaign.
*/
class CampaignInfo extends Component {

	constructor(props) {
		super(props);	

		this.state = {
			file: {},
			description: "",
			name: "",
			world: "",
			setting: "",
			error: null,
			textAreaStyle: {height: "100%",},
			textAreaHeight: 50,
		}

		// Set the context for "this" for the following functions
		//this.uploadCampaign = this.uploadCampaign.bind(this);
		//this.updateFile = this.updateFile.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);

		// Set up a file reader for campaign importing
		// NOTE: Campaign importing is currently disabled since there are no security
		// checks in place for the files being imported 
		//this.fileReader = new FileReader();
		//this.fileReader.onload = (event) => {
		//	console.log(event.target)
		//	this.setState({ file: JSON.parse(event.target.result)});
		//};
	}

	// Will be called when component mounts, and put necessary information in the state
	// if a campaign is being edited
	componentDidMount() {

		// Put the current information about the campaign in the state
		if(this.props.edit) {
			this.setState({ 
				name: this.props.campaign.name,
				world: this.props.campaign.world,
				setting: this.props.campaign.setting,
				description: this.props.campaign.description,
			});
		}
	}

	componentDidUpdate() {
		// Handles automatic sizing of the campaign description text area. It will
		// always try to adjust to fit all text in the description
		if(this.textArea && this.textArea.scrollHeight !== this.state.textAreaHeight) {
			this.setState({
				textAreaStyle: {height: "max(" + this.textArea.scrollHeight + "px, 50px",},
				textAreaHeight: this.textArea.scrollHeight,
			});
		}
	}


	// Function for uploading a campaign from a JSON file
	// NOTE: Campaign importing is currently disabled since there are no security
	// checks in place for the files being imported
	// NOTE II: This function is using old backend structure and needs to be modified 
	// to work properly
	/*uploadCampaign(event) {
		event.preventDefault();
		this.props.onHide();
		console.log(this.state.file)

		// Dates in the JSON file are strings, this converts them to date objects
		for (let session of Object.values(this.state.file.campaign.sessions)) {
			session.created = new Date(session.created.nanoseconds / 1000000 + session.created.seconds * 1000)
			session.date = new Date(session.date.nanoseconds / 1000000 + session.date.seconds * 1000)
		}
		for (let tag of Object.values(this.state.file.campaign.tags)) {
			tag.created = new Date(tag.created.nanoseconds / 1000000 + tag.created.seconds * 1000)
		}

		let campaigns = this.props.campaigns;	
		
		// Add to Firestore, which will generate an id, then add localy using the id
		this.props.campaignsRef.add(this.state.file.campaign) // Add campaign
		.then((docRef) => {
			console.log("Document successfully written! DocRef: ", docRef);

			// Add locally
			campaigns[docRef.id] = this.state.file.campaign;
			this.props.handleCampaigns(campaigns);

			// Add sessions
			for (let [sessionID, session] of Object.entries(this.state.file.sessions)) {

				this.props.campaignsRef.doc(docRef.id).collection("sessions").doc(sessionID).set(session)
				.then(function() {
					console.log("Document successfully updated!");
				}).catch(function(error) {
					console.log("Error getting document:", error);
				});
			}

			// Add tags
			for (let [tagID, tag] of Object.entries(this.state.file.tags)) {

				this.props.campaignsRef.doc(docRef.id).collection("tags").doc(tagID).set(tag)
				.then(function() {
					console.log("Document successfully updated!");
				}).catch(function(error) {
					console.log("Error getting document:", error);
				});
			}
		})
		.catch(error => {
			console.error("Error writing document: ", error);
		});
		
	}*/

	// Triggers when campaign info is submitted
	onSubmit(event) {

		// Hide the campaign info window
		this.props.onHide();
		event.preventDefault();

		// Do different tasks depending on if editing an existing campaign
		// or adding a new campaign
		if(!this.props.edit) {
			// Add Campaign
			// Create campaign info
			let campaign = {
				operation: "campaign-create",
				activeTab: "sessions",
				description: this.state.description,
				name: this.state.name,
				world: this.state.world,
				recapID: "",
				recapOrder: [],
				setting: this.state.setting,
				sessionOrder: [],
				sessions: {},
				selectedSession: "",
				sharingIsOn: false,
				usersSharedWith: {},
				usersSharedWithList: [],
				userLastHandled: "",
				tags: {},
				selectedTag: "",
				ownerUsername: this.props.firebase.auth.currentUser.displayName,
				ownerID: this.props.firebase.auth.currentUser.uid,
				numberOfKeys: 0,
			};

			let campaigns = this.props.campaigns;		

			// Add to Firestore, which will generate an id, then add localy using the id
			this.props.campaignsRef.add(campaign)
			.then((docRef) => {
				console.log("Campaign successfully added! DocRef: ", docRef);

				// Add locally
				campaigns[docRef.id] = campaign;
				this.props.handleCampaigns(campaigns);

				// Add campaign to owned campaigns list on user document
				this.props.firebase.db.collection("users").doc(campaign.ownerID).update({
					ownedCampaigns: firebase.firestore.FieldValue.arrayUnion(docRef.id)
				}).then(() => {
					console.log("Campaign successfully added to user document!");
				}).catch((error) => {
					console.log("Error adding campaign to user document:", error);
				});
			}).catch(error => {
				console.error("Error adding campaign: ", error);
				this.props.handleError(error, "Could not add campaign");
			});
		} else {
			// Edit campaign
			// Edit campaign document on Firestore
			this.props.campaignsRef.doc(this.props.campaignID).update({
				operation: "campaign-info-update",
				description: this.state.description,
				name: this.state.name,
				world: this.state.world,
				setting: this.state.setting,
			}).then(() => {
				console.log("Campaign successfully updated!");
				// Edit locally
				let campaign = this.props.campaigns[this.props.campaignID];
				campaign["name"] = this.state.name;
				campaign["description"] = this.state.description;
				campaign["world"] = this.state.world;
				campaign["setting"] = this.state.setting;

				// If this is the last visited campaign, update user data name
				if(this.props.campaignID === this.props.userDataContext.userData.lastCampaignID) {
					// Update on Firetore
					this.props.firebase.db.collection("users").doc(this.props.firebase.auth.currentUser.uid).update({
						lastCampaignID: this.props.campaignID,
						lastCampaignName: this.state.name,
					}).then(() => {
						console.log("User data successfully updated!");
						// Update locally
						this.props.userDataContext.updateUserData({
							lastCampaignID: this.props.campaignID,
							lastCampaignName: this.state.name,
						});
					}).catch((error) => {
						console.log("Error updating user data:", error);
					});
				}

				let campaigns = this.props.campaigns;
				campaigns[this.props.campaignID] = campaign;
				this.props.handleCampaigns(campaigns);
			}).catch((error) => {
				console.log("Error editing campaign:", error);
				this.props.handleError(error, "Could not edit campaign");
			});
		}
	};
	  
	// Triggers when changing campaing info
	onChange(event) {
    	this.setState({ [event.target.name]: event.target.value });

		// When writing in the description field, also adjust scroll height of the text area
		if(event.target.name === "description") {
			this.setState({ 
				text: event.target.value,
				textAreaStyle: {height: "auto",},
			}, () =>
				this.setState({
					textAreaStyle: {height: "max(" + this.textArea.scrollHeight + "px, 50px",}
				})
			);
		}
	};
	  
	// Triggers when adding a file to the upload form
	//updateFile(event) {
	//	console.log(event.target.files[0]);
	//	this.fileReader.readAsText(event.target.files[0]);
	//}

	render() {

		const { description, name, world, setting, error } = this.state;
		const isInvalid = name === '';

		let title, submit;

		// Change texts based on whether editing or adding
		if(this.props.edit) {
			title = "Edit Campaign";
			submit = "Submit changes";
		} else {
			title = "Create a new campaign";
			submit = "Create campaign";
		}

		return (
			<Modal
				show={this.props.show}
				onHide={this.props.onHide}
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Header className="grey-background" closeButton>
				<Modal.Title>{title}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={this.onSubmit}>
						<Form.Group className="mb-3" controlId="formCampaignName">
							<Form.Label>Campaign Name</Form.Label>
							<Form.Control 
								name="name"
								value={name}
								onChange={this.onChange}
								type="text"
								placeholder="Campaign name..."
								maxLength="140" 
							/>
							<Form.Text className="text-muted">
								For example "Glorious Adventures in Middle Earth".
							</Form.Text>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formDescription">
							<Form.Label>Campaign Description</Form.Label>
							<Form.Control
								ref={textArea => this.textArea = textArea}
								name="description"
								value={description}
								onChange={this.onChange}
								as="textarea"
								type="text"
								placeholder="Campaign description..."
								maxLength="2000"
								style={this.state.textAreaStyle}
								className="form-description-campaign"
							/>
							<Form.Text className="text-muted">
								A short description of the campaign. 
							</Form.Text>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formWorld">
							<Form.Label>World</Form.Label>
							<Form.Control 
								name="world"
								value={world}
								onChange={this.onChange}
								type="text"
								placeholder="World..."
								maxLength="70"
							/>
							<Form.Text className="text-muted">
								For example "Middle Earth".
							</Form.Text>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formSetting">
							<Form.Label>Setting</Form.Label>
							<Form.Control 
								name="setting"
								value={setting}
								onChange={this.onChange}
								type="text"
								placeholder="Setting..."
								maxLength="70"
							/>
							<Form.Text className="text-muted">
								For example "Fantasy".
							</Form.Text>
						</Form.Group>
						
						<Button variant="success" type="submit" disabled={isInvalid}>
							{submit}
						</Button>

						{error && <p>{error.message}</p>}
					</Form>
					{/* <Form onSubmit={(event) => this.uploadCampaign(event)}>
						<Form.File
							name="file"
							id="custom-file"
							label="Custom file input"
							custom
							onChange={this.updateFile}
						/>
						<Button variant="success" type="submit">
							Upload campaign
						</Button>
					</Form> */}
				</Modal.Body>
			</Modal>
		)
	}
}

export default withFirebase(CampaignInfo);