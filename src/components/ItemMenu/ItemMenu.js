import React, { Component } from 'react';

import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'

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

	render() {		
		
		return (
			<Dropdown>
				<Dropdown.Toggle as={CustomToggle} />
				<Dropdown.Menu>
					<Dropdown.Item href="#/action-1">Edit</Dropdown.Item>
					<Dropdown.Item href="#/action-2">Delete</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>
		);
	}
}

export default ItemMenu