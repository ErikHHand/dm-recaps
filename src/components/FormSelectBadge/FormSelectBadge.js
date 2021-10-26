import React, { Component } from 'react';

import { COLOURS } from '../../constants/colours.js';
import { TEXTCOLOURS } from '../../constants/colours.js';
import { TYPES } from '../../constants/types.js';
import { ICONS } from '../../constants/types.js';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import Form from 'react-bootstrap/Form'
import Overlay from 'react-bootstrap/Overlay'
import Popover from 'react-bootstrap/Popover'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/*
	This class holds the component used both for selecting tag type and 
	tag colour when adding and editing tags in the TagInfo component.
*/
class FormSelectBadge extends Component {

	constructor(props) {
		super(props);

		// Function for attaching references to elements
		this.attachRef = target => this.setState({ target });

		this.state = {
			show: false,
		}

		// Set the context for "this" for the following functions
		this.changeValue = this.changeValue.bind(this);
	}

	// Triggered when selecting a value (for example a type or a colour)
	// Closes this selector and changes the value in the parent component
	changeValue(value) {
		this.setState({
			show: false,
		});
		this.props.changeValue(this.props.name, value);
	}

	render() {

		const { show, target } = this.state;

		let formSelectBadge  = this;
		let options = null;

		// Fill the select pop-up with different badges depending on
		// if the component is used for selecting colour or selecting type
		if(this.props.name === "colour") {
			options = Array.from(Object.keys(COLOURS)).map((colour) =>
				<Badge 
					pill 
					style = {{ backgroundColor: COLOURS[colour]}} 
					key = {colour}
					className = {TEXTCOLOURS[colour] + " select-badge"}
					onClick={() => this.changeValue(colour)}
					bg="bullshit"
				>
					TAG
				</Badge>
			);
		} else if(this.props.name === "type") {
			options = Array.from(Object.keys(TYPES)).map((type) =>
				<Badge 
					pill 
					key = {type}
					className = "select-type select-badge"
					onClick={() => this.changeValue(type)}
					bg="bullshit"
				>
					<FontAwesomeIcon icon={ICONS[type]}/>
					&nbsp;
					{TYPES[type]}
				</Badge>
			);
		}
	
		// Set form field name, with first lettter to upper case
		let name = this.props.name.charAt(0).toUpperCase() + this.props.name.slice(1);

		let value = "Select..."; // Placeholder value

		// Create the badge shown as the currently selected alternative, with different
		// styles depending on if selecting colour or type
		if(this.props.value) {
			for(let option in options) { 
				if(options[option].key === this.props.value) {
					if(this.props.name === "colour") {
						value = <Badge 
							pill 
							style = {{ backgroundColor: COLOURS[this.props.value]}} 
							className = {TEXTCOLOURS[this.props.value] + " select-badge"}
							bg="bullshit"
						>
							TAG
						</Badge>;
					} else if(this.props.name === "type") {
						value = <Badge 
							pill 
							className = "select-type select-badge"
							bg="bullshit"
						>
							<FontAwesomeIcon icon={ICONS[this.props.value]} />
							&nbsp;
							{TYPES[this.props.value]}
						</Badge>;
					}
					break;
				}
			}
		}

		return (
			<>
				<Form.Label>
					{name}
				</Form.Label>
				<div 
					onClick={() => this.setState({ show: !show })}
					className="form-control remove-padding"
				>
					<div ref={this.attachRef} className = "select-tag">
						{value}
					</div>
				</div>
				
				<Overlay 
					target={target} 
					show={show ? true : false} 
					placement="bottom" 
					rootClose={true}
					onHide={() => formSelectBadge.setState({show: false})}
				>
					{({ show: _show,...props }) => (
						<Popover id="popover-basic" title={"Choose " + this.props.name}  {...props}>
								{options}
						</Popover>
					)}
				</Overlay>
			</>
		)
	}
}

export default FormSelectBadge

/*
<Row onClick={() => this.setState({ show: !show })} xs={12}>
					<Col xs={2}>			
						<div className = "select-label right-align">{name}</div>
					</Col>
					<Col xs={10} className="remove-padding">
						<div className = "select-border">
							<div ref={this.attachRef} className = "select-tag">
								{value}
							</div>
						</div>
					</Col>
				</Row>
*/