import React, { Component } from 'react';

import Dropdown from 'react-bootstrap/Dropdown'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button';

/*
	This class holds the three dots the brings up the item menu when clicked
*/
class CustomToggle extends Component {
	constructor(props, context) {
	  	super(props, context);
		
		// Set the context for "this" for the following function
	  	this.handleClick = this.handleClick.bind(this);
	}
  
	// Triggers when the three dots are clicked
	handleClick(e) {
	  	e.preventDefault();
	  	this.props.onClick(e);
	}
  
	render() {
		return (
			<i onClick={this.handleClick} className="fas fa-ellipsis-h item-menu"></i>
		);
	}
}

/*
	This class holds the menu that is shown when the three dots are clicked.
	This menu currently has "edit" and "delete" as options
	If edit is clicked, the parent decides what happens
	If delete is clicked, a confirmation window is shown
*/
class ItemMenu extends Component {
	constructor(props) {
		super(props);
	  
		this.state = {
			showDeleteWindow: false,
		};

		// Set the context for "this" for the following functions
		this.showDeleteWindow = this.showDeleteWindow.bind(this);
		this.hideDeleteWindow = this.hideDeleteWindow.bind(this);
  	}

	// Show the confirmation window for deleting
	showDeleteWindow(){		
		this.setState({
			showDeleteWindow: true,
		})
	}

	// Hide the confirmation window for deleting
	hideDeleteWindow(){
		this.setState({
			showDeleteWindow: false,
		})
	}

	render() {		
		return (
			<>
				<Dropdown>
					<Dropdown.Toggle as={CustomToggle} />
					<Dropdown.Menu>
						<Dropdown.Item onClick={this.props.edit}>Edit</Dropdown.Item>
						<Dropdown.Item onClick={this.showDeleteWindow}>Delete</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
				<Modal
					show={this.state.showDeleteWindow}
					onHide={this.hideDeleteWindow}
				>
					<Modal.Header closeButton>
						<Modal.Title>{this.props.deleteText.title}</Modal.Title>
					</Modal.Header>
					<Modal.Body>{this.props.deleteText.text}</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={this.hideDeleteWindow}>
							Close
						</Button>
						<Button variant="danger" onClick={() => {this.hideDeleteWindow(); this.props.delete();}}>
							Delete
						</Button>
					</Modal.Footer>
				</Modal>
			</>
		);
	}
}

export default ItemMenu