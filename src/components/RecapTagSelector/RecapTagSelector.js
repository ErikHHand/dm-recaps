import React, { Component } from 'react';

import TagFilter from '../TagFilter/TagFilter';
import TagInfo from '../TagInfo/TagInfo';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import Overlay from 'react-bootstrap/Overlay'
import Popover from 'react-bootstrap/Popover'
import { Button } from 'react-bootstrap';

import { COLOURS } from '../../constants/colours.js';
import { TEXTCOLOURS } from '../../constants/colours.js';
import { ICONS } from '../../constants/types.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

/*
	This class holds the component for selecting tags to attach to recap items.
	This includes the bottom row of the recap item where currently attached tags are shown,
	as well as the pop-up window for attaching and removing tags.

	The component keeps track of the tags currently selected for the recap item in
	the state, but does not handle the actual writing to backend. This is handled in
	the RecapItem component.
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
			filteredTags: [], // Holds tags shown in the selector based on the current filter
			tag: {name: "", description: "", type: "Location", colour: "red"},
			tags: tags, // Holds all tags of this campaign with a T/F value based on selection
			showTagOverlay: false,
			showTagInfo: false,
			windowWidth: 0,
		}

		// Set the context for "this" for the following functions
		this.onSubmit = this.onSubmit.bind(this);
		this.onClick = this.onClick.bind(this);
		this.handleFilteredTags = this.handleFilteredTags.bind(this);
		this.changeWindow = this.changeWindow.bind(this);
		this.updateDimension = this.updateDimension.bind(this);
	}

	componentDidMount() {
		// Add a listener for the window size
		window.addEventListener('resize', this.updateDimension);
	}

	componentWillUnmount() {
		// Remove listener
		window.removeEventListener('resize', this.updateDimension);
	}

	// Triggers when an update to component happens
	// This is used to handle a change in number of tags caused by 
	// adding or deleting tags from the campaign
	componentDidUpdate() {

		let oldKeys = Object.keys(this.state.tags);
		let newKeys = Object.keys(this.props.campaign.tags);
		
		// Check if the number of tags has changed
		if(oldKeys.length !== newKeys.length) {
			let tags = {};
			for (let tag in this.props.campaign.tags) {
				tags[tag] = this.props.recapItem.tags.includes(tag) || this.state.tags[tag];			
			}

			// Add newly created tag from tag selector pop-up
			let newTag = newKeys.filter(x => !oldKeys.includes(x))[0];
			if(newTag) {
				tags[newTag] = true && this.state.showTagOverlay;
			}
			
			this.setState({
				tags: tags,
			});
		}		
	}

	// Triggers when detecting a change in window width. This is for dynamically
	// adjusting the number of columns with tags in
	updateDimension() {
		this.setState({ windowWidth: window.innerWidth });
	}

	// Triggers when a new filter is entered
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
		});
	};

	// This function is called when a user submits changes to
	// which tags are attached to the recap item
	onSubmit() {

		// Hide tag selection pop-up
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
		
		// Save old recap to simplify removal of tags from the recap item
		let oldRecap = {
			tags: [...this.props.recapItem.tags],
			text: this.props.recapItem.text,
			session: this.props.recapItem.session,
		};

		// Update recap Item with potentially new text and tags
		let recapItem = this.props.recapItem;
		recapItem.tags = tags;
		this.props.writeRecap(recapItem, oldRecap);
	};

	// This function is called when changing visibility of the tag selection pop-up
	// and the tag info component for adding new tags
	changeWindow() {
		this.setState({
			showTagInfo: !this.state.showTagInfo,
			showTagOverlay: !this.state.showTagOverlay
		});
	}

	render() {

		let recapTagSelector = this;
		let tagFilter;

		// Only render the tag filter component if there is at least one tag
		if(!this.props.campaign.tags) {
			tagFilter = <div></div>; //Render nothing if there are no tags
		} else {
			tagFilter = <TagFilter
							campaign = {this.props.campaign}
							filteredTags = {this.state.filteredTags}
							handleFilteredTags = {this.handleFilteredTags}
							tagSort = "4" // Will sort alphabetical
							focus = {this.state.showTagOverlay}
						/>
		}


		// Divide all filtered tags into correct number of groups to
		// put in different columns in the tag selection pop-up
		let numberOfColumns = 3;
		let allTags = [];
		let cols = [];

		// Divide into two or three columns depending on screen width
		if (window.innerWidth < 576) {
			numberOfColumns = 2;
			let col1Length = Math.ceil(this.state.filteredTags.length / 2);
			cols[0] = this.state.filteredTags.slice(0, col1Length);
			cols[1] = this.state.filteredTags.slice(col1Length, this.state.filteredTags.length);
		} else {
			let col1Length = Math.ceil(this.state.filteredTags.length / 3);
			let col2Length = this.state.filteredTags.length > 1 ? Math.ceil((this.state.filteredTags.length - col1Length) / 2) : 0
			cols[0] = this.state.filteredTags.slice(0, col1Length);
			cols[1] = this.state.filteredTags.slice(col1Length, col1Length + col2Length);
			cols[2] = this.state.filteredTags.slice(col1Length + col2Length, this.state.filteredTags.length);
		}

		// For each column, create the tag badge and put in the column
		for(let i = 0; i < numberOfColumns; i++) {
			allTags[i] = cols[i].map((tagID) => {
				if(this.props.campaign.tags[tagID]) { // Avoid bug when filtered tag doesn't exists for some reason
					return (
						<div style={{display: "block"}} key={tagID}>
							<Badge 
								pill 
								style={{ backgroundColor: COLOURS[this.props.campaign.tags[tagID].colour]}} 
								className={
									TEXTCOLOURS[this.props.campaign.tags[tagID].colour] +
									(!this.state.tags[tagID] ? " tag-not-selected tag-selector-tag tag transition-border" : " tag-selector-tag tag transition-border")
								}
								onClick={() => this.onClick(tagID)}
								bg="bullshit"
							>
								<FontAwesomeIcon icon={ICONS[this.props.campaign.tags[tagID].type]} />
								&nbsp;
								{this.props.campaign.tags[tagID].name}
							</Badge>
						</div>
					)
				} else {
					return <div key={tagID}></div>
				}
				
			});
		}

		// Create the tags currently attached to this recap
		let recapTags = this.props.recapItem.tags.map((tagID) => {
			if(this.props.campaign.tags[tagID]) { // Avoid bug when tag doesn't exists for some reason
				return (
					<Badge 
						pill 
						style={{ backgroundColor: COLOURS[this.props.campaign.tags[tagID].colour]}} 
						key={this.props.recapItem.tags.indexOf(tagID)}
						className={TEXTCOLOURS[this.props.campaign.tags[tagID].colour] + " recap-tag tag transition-border"}
						onClick={() => this.props.handleSelectedTag(tagID)}
						bg="bullshit"
					>
						<FontAwesomeIcon icon={ICONS[this.props.campaign.tags[tagID].type]} />
						&nbsp;
						{this.props.campaign.tags[tagID].name}
					</Badge>
			);
			} else {
				return <div key={tagID}></div>
			}
		});

		let textClassNames = "regular-text tag-selector-text center remove-scroll-bar with-line-breaks"

		return (
			<div className="right-align">
				{recapTags}
				<Badge 
					pill 
					className="recap-add-tag item-add-button" 
					onClick={() => 
						this.setState({ 
							showTagOverlay: !this.state.showTagOverlay,
						})}
					bg="bullshit"
					ref={this.attachRef}
				>
					<FontAwesomeIcon icon={faPlus} />
				</Badge>
				<Overlay 
					target={this.state.target} 
					show={this.state.showTagOverlay ? true : false} 
					placement="left" 
					rootClose={true}
					onHide={() => recapTagSelector.setState({showTagOverlay: false})}
				>
					{({ show: _show, ...props }) => (
						<Popover id="popover-basic" {...props} className="tag-selector">
							<Popover.Header>
								<Row>
									<Col className={textClassNames}>
										{this.props.recapItem.text}
									</Col>
								</Row>
								
							</Popover.Header>
							<Popover.Body>
								<Row>
									<Col>
										<div className="select-filter-bar center">
											{tagFilter}
										</div>
									</Col>
								</Row>
								

								<Row className="tag-selector-tag-field remove-scroll-bar">
									<Col className="center" sm={4} xs={6}>
										{allTags[0]}
									</Col>
									<Col className="border-left center" sm={4} xs={6}>
										{allTags[1] ? allTags[1] : <></>}
									</Col>
									<Col className="border-left center" sm={4} xs={0}>
										{allTags[2] ? allTags[2] : <></>}
									</Col>
								</Row>
								
								<Row className="button-row">
									<Col xs={6}>
										<Button variant="success" onClick={this.changeWindow}>
											New Tag
										</Button>
									</Col>
									<Col xs={1} className="remove-padding">
									</Col>
									<Col xs={5} className="right-align">
										<Button variant="info" onClick={this.onSubmit}>
											Done
										</Button>
									</Col>
								</Row>
							</Popover.Body>
						</Popover>
					)}
				</Overlay>
				
				<TagInfo 
					show = {this.state.showTagInfo}
					onHide = {this.changeWindow}
					tags = {this.props.tags}
					campaign = {this.props.campaign}
					handleTags = {this.props.handleTags}
					handleCampaign = {this.props.handleCampaign}
					campaignRef = {this.props.campaignRef}
					edit = {false}
					tagID = {null}
					tag = {this.state.tag}
					selectTag = {false}
					handleSelectedTag = {this.props.handleSelectedTag}
					handleError = {this.props.handleError}
					loadCampaign = {this.props.loadCampaign}
				/>
			</div>
		)
	}
}

export default RecapTagSelector
