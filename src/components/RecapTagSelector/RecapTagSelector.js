import React, { Component } from 'react';

import TagFilter from '../TagFilter/TagFilter';

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
			filteredTags: [],
			tags: tags,
			showTagOverlay: false,
		}

		// Set the context for "this" for the following functions
		this.onSubmit = this.onSubmit.bind(this);
		this.onClick = this.onClick.bind(this);
		this.handleFilteredTags = this.handleFilteredTags.bind(this);
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

	handleFilteredTags(filteredTags) {
		this.setState({
			filteredTags: filteredTags,
		})
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
		
		this.props.writeRecap(recapItem, previousTags);
	};

	render() {
		let recapTagSelector = this;

		let allTags = [];
		let cols = [];
		let col1n2Length = Math.ceil(this.state.filteredTags.length / 3);
		cols[0] = this.state.filteredTags.slice(0, col1n2Length);
		cols[1] = this.state.filteredTags.length > 1 ? 
					this.state.filteredTags.slice(col1n2Length, col1n2Length * 2) : [];
		cols[2] = this.state.filteredTags.slice(col1n2Length * 2, this.state.filteredTags.length);

		for(let i = 0; i < 3; i++) {
			// The tags for the overlay where you select what tags to tag the recap with
			allTags[i] = cols[i].map((tagID) => {
				return (
					<Badge 
						pill 
						style={{ backgroundColor: COLOURS[this.props.campaign.tags[tagID].colour]}} 
						key={tagID}
						className={
							TEXTCOLOURS[this.props.campaign.tags[tagID].colour] +
							(!this.state.tags[tagID] ? " tag-not-selected tag-selector-tag" : " tag-selector-tag")
						}
						onClick={() => this.onClick(tagID)}
					>
						<FontAwesomeIcon icon={ICONS[this.props.campaign.tags[tagID].type]} />
						&nbsp;
						{this.props.campaign.tags[tagID].name}
					</Badge>
				)
			});
		}
		

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
						<Popover id="popover-basic" {...props} className="tag-selector">
							<Popover.Title as="h3">
								<Row>
									<Col className="filter-bar-width">
										<TagFilter
											campaign = {this.props.campaign}
											filteredTags = {this.state.filteredTags}
											handleFilteredTags = {this.handleFilteredTags}
											tagSort = "4" // Will sort alphabetical
										/>
									</Col>
								</Row>
							</Popover.Title>
							<Popover.Content>
								<Row>
									<Col className="border-right">
										{allTags[0]}
									</Col>
									<Col className="border-right">
										{allTags[1]}
									</Col>
									<Col>
										{allTags[2]}
									</Col>
								</Row>
								
								<Row className="button-row" noGutters={true}>
									<Col md={4}>
										<Button variant="info" onClick={this.onSubmit}>Done</Button>
									</Col>
									<Col md={4}>
									</Col>
									<Col md={4} className="right-align">
										<Button variant="success">New Tag</Button>
									</Col>
								</Row>
							</Popover.Content>
						</Popover>
					)}
				</Overlay>
			</div>
		)
	}
}

export default RecapTagSelector