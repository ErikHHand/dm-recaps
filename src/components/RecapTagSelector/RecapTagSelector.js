import React, { Component } from 'react';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import Overlay from 'react-bootstrap/Overlay'
import Popover from 'react-bootstrap/Popover'
import PopoverContent from 'react-bootstrap/PopoverContent'
import PopoverTitle from 'react-bootstrap/PopoverTitle'
import { Form, Button } from 'react-bootstrap';

import { COLOURS } from '../../constants/colours.js';
import { TEXTCOLOURS } from '../../constants/colours.js';
import { TYPES } from '../../constants/types.js';
import { ICONS } from '../../constants/types.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/*
	
*/
class RecapTagSelector extends Component {

	constructor(props) {
		super(props);

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
		}

		// Set the context for "this" for the following functions
		this.onSubmit = this.onSubmit.bind(this);
		this.onClick = this.onClick.bind(this);
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

	// Triggers when changing tags
	// Updates tags for this recap item
	onClick(tagID) {
    	let tags = this.state.tags;
		tags[tagID] = !this.state.tags[tagID];

		this.setState({
			tags: tags,
		}, console.log(tags));
	};

	// Edits the recap.
	// This function is called when changing tags 
	onSubmit() {
		this.setState({
			showTagOverlay: false,
		})

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

		console.log(previousTags)
		console.log(recapItem.tags)
		
		this.props.writeRecap(recapItem, previousTags);
	};

	render() {
		let recapTagSelector = this;

		// The tags for the overlay where you select what tags to tag the recap with
		let allTags = Array.from(Object.keys(this.props.campaign.tags)).map((tagID) => {
			return (
				<Badge 
					pill 
					style={{ backgroundColor: COLOURS[this.props.campaign.tags[tagID].colour]}} 
					key={tagID}
					className={
						TEXTCOLOURS[this.props.campaign.tags[tagID].colour] +
						(!this.state.tags[tagID] ? " tag-not-selected" : "")
					}
					onClick={() => this.onClick(tagID)}
				>
					<FontAwesomeIcon icon={ICONS[this.props.campaign.tags[tagID].type]} />
					&nbsp;
					{this.props.campaign.tags[tagID].name}
				</Badge>
			)
		});

		// The tags currently attached to this recap
		let recapTags = this.props.recapItem.tags.map((tagID) =>
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

		return (
			<div className="right-align">
				{recapTags}
				<Badge 
					pill 
					variant="light" 
					className="add-tag" 
					onClick={() => this.setState({ showTagOverlay: !this.state.showTagOverlay })}
					ref={this.attachRef}
				>
					+
				</Badge>
				<Overlay 
					target={this.state.target} 
					show={this.state.showTagOverlay ? true : false} 
					placement="left" 
					rootClose={true}
					onHide={() => recapTagSelector.setState({showTagOverlay: false})}
				>
					{({
						show: _show,
						...props
					}) => (
						<Popover id="popover-basic" {...props}>
							<Popover.Title as="h3">
								Choose tags
							</Popover.Title>
							<Popover.Content>
								{allTags}
								<Button variant="info" onClick={this.onSubmit}>Done</Button>
							</Popover.Content>
						</Popover>
					)}
				</Overlay>
			</div>
		)
	}
}

export default RecapTagSelector