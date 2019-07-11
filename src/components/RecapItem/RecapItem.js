import React, { Component } from 'react';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import Overlay from 'react-bootstrap/Overlay'
import Popover from 'react-bootstrap/Popover'
import { Form, Button } from 'react-bootstrap';

import { withFirebase } from '../Firebase/Firebase';

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
		for (let tag in this.props.tags) {
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
		
		// Add locally
		let recapItem = this.props.recapItem;
		let sessions = this.props.sessions;

		sessions[recapItem.session].recaps[this.props.recapID].tags = tags
		this.props.handleSessions(sessions);
		
		// Add to Firestore 
		
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
		
	};

	onChange = event => {
    	let tags = this.state.tags;
		tags[event.target.name] = event.target.checked;

		this.setState({
			tags: tags,
		});
  	};

	render() {

		let tagValues = this.state.tags;

		const { showTagOverlay, target } = this.state;

		let selectTags = Array.from(Object.keys(this.props.tags)).map((tagID) => {

			return (
				<Form.Group id="formCheckbox" key={tagID} name={tagID}>
					<Form.Check 
						type="checkbox" 
						label={tagID} 
						name={tagID} 
						checked={this.state.tags[tagID]} 
						onChange={this.onChange}/>
				</Form.Group>
			)
		});

		const popover = (
			<Popover id="popover-basic" title="Choose tags">
				<Form onSubmit={this.onSubmit}>
					{selectTags}
					<Button variant="secondary" type="submit">Done</Button>
				</Form>
			</Popover>
		);

		let tags = this.props.recapItem.tags.map((tag) =>
			<Badge 
				pill 
				style={{ backgroundColor: this.props.tags[tag].colour}} 
				key={this.props.recapItem.tags.indexOf(tag)}
				className="text-white"
			>
				{tag}
			</Badge>
		);
		
		return (
			<Card body onClick = {this.props.click}>
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
							<Overlay target={target} show={showTagOverlay} placement="right">
								{props => (
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
			</Card>
		)
	}
}

export default withFirebase(RecapItem)