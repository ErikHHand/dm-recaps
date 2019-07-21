import React, { Component } from 'react';

import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button';

class CustomToggle extends Component {
	constructor(props, context) {
	  	super(props, context);
		
	  	this.handleClick = this.handleClick.bind(this);
	}
  
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

class ItemMenu extends Component {
	constructor(props) {
		super(props);
	  
		this.state = {
			showDeleteWindow: false,
		};

		this.showDeleteWindow = this.showDeleteWindow.bind(this);
		this.hideDeleteWindow = this.hideDeleteWindow.bind(this);
  	}

	showDeleteWindow(){		
		this.setState({
			showDeleteWindow: true,
		})
	}

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