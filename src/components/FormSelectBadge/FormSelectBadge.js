import React, { Component } from 'react';

import { COLOURS } from '../../constants/colours.js';
import { TEXTCOLOURS } from '../../constants/colours.js';
import { TYPES } from '../../constants/types.js';
import { ICONS } from '../../constants/types.js';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import Overlay from 'react-bootstrap/Overlay'
import Popover from 'react-bootstrap/Popover'
import Form from 'react-bootstrap/Form';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/*
	
*/
class FormSelectBadge extends Component {

	constructor(props) {
		super(props);

		// TODO: WTF does this line do??? Something with tag pop-up...
		this.attachRef = target => this.setState({ target });

		this.state = {
			show: false,
		}

		// Set the context for "this" for the following functions
		this.changeValue = this.changeValue.bind(this);
	}

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


		if(this.props.name === "colour") {
			options = Array.from(Object.keys(COLOURS)).map((colour) =>
				<Badge 
					pill 
					style = {{ backgroundColor: COLOURS[colour]}} 
					key = {colour}
					className = {TEXTCOLOURS[colour] + " select-badge"}
					onClick={() => this.changeValue(colour)}
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
				>
					<FontAwesomeIcon icon={ICONS[type]}/>
					&nbsp;
					{TYPES[type]}
				</Badge>
			);
		}
		
		
		let value = "Select...";

		let name = this.props.name.charAt(0).toUpperCase() + this.props.name.slice(1) + ":";

		if(this.props.value) {
			for(let option in options) {
				if(options[option].key === this.props.value) {
					if(this.props.name === "colour") {
						value = <Badge 
							pill 
							style = {{ backgroundColor: COLOURS[this.props.value]}} 
							className = {TEXTCOLOURS[this.props.value] + " select-badge"}
						>
							TAG
						</Badge>;
					} else if(this.props.name === "type") {
						value = <Badge 
							pill 
							className = "select-type select-badge"
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
				<Row onClick={() => this.setState({ show: !show })} xs={12}>
					<Col xs={2}>			
						<div className = "select-label right-align">{name}</div>
					</Col>
					<Col xs={10} className="remove-padding">
						<div className = "select-border">
							<div 
								ref={this.attachRef}
								className = "select-tag"
							>
								{value}
							</div>
						</div>
					</Col>
				</Row>
				<Overlay 
					target={target} 
					show={show ? true : false} 
					placement="bottom" 
					rootClose={true}
					onHide={() => formSelectBadge.setState({show: false})}
				>
					{({
						show: _show,
						...props
					}) => (
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