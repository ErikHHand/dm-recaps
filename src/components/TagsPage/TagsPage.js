import React, { Component } from 'react';

import RecapItem from '../RecapItem/RecapItem';
import TagItem from '../TagItem/TagItem';
import TagInfo from '../TagInfo/TagInfo';
import TagFilter from '../TagFilter/TagFilter';
import TagDescription from '../TagDescription/TagDescription';
import SortArrowsColumn from '../SortArrowsColumn/SortArrowsColumn';
import Spinner from 'react-bootstrap/Spinner'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { withFirebase } from '../Firebase/Firebase';

/*
	This component holds the tags tab of the app. It handles dynamically updating the height of the
	recap item list, as well as the rendering and sorting of recap item list and tag item list.
*/
class TagsPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			focus: false,
			recapSortDescending: false,
			recapListStyle: { height: "100%",},
			recapListHeight: 0,
			showTagInfo: false,
			filteredTags: [],
			tagSort: 1,
			windowHeight: 0,
		};

		// Set the context for "this" for the following functions
		this.updateDimension = this.updateDimension.bind(this);
		this.handleFilteredTags = this.handleFilteredTags.bind(this);
		this.changeSort = this.changeSort.bind(this);
	}

	componentDidMount() {
		// Add a listener for the window size for dynamically changing height of recap list
		window.addEventListener('resize', this.updateDimension);
	}

	componentWillUnmount() {
		// Remove listener
		window.removeEventListener('resize', this.updateDimension);
	}

	// Triggers when props for component updates
	// This is used to dynamically adjust the height of the recap item list, 
	// based on the height of the tag description box (tried doing it with css, but no luck...)
	componentDidUpdate() {
		if(this.props.selectedTag && this.props.activeTab === "tags") {
			let div1Height = window.getComputedStyle(this.tagDescription).getPropertyValue("height");
			let div1FontSize = window.getComputedStyle(this.tagDescription).getPropertyValue("font-size");
			let containerHeight = window.getComputedStyle(this.recapItemColumn).getPropertyValue("height");
			let containerFontSize = window.getComputedStyle(this.recapItemColumn).getPropertyValue("font-size");

			div1Height = Number(div1Height.substring(0, div1Height.length - 2));
			div1FontSize = Number(div1FontSize.substring(0, div1FontSize.length - 2));
			containerHeight = Number(containerHeight.substring(0, containerHeight.length - 2));
			containerFontSize = Number(containerFontSize.substring(0, containerFontSize.length - 2));

			let recapListHeight = containerHeight / containerFontSize - div1Height / div1FontSize;
			
			if(this.state.recapListHeight !== recapListHeight) {
				this.setState({
					recapListStyle: { height: recapListHeight + "rem"},
					recapListHeight: recapListHeight,
				});
			}
		}

		if(this.props.campaign.activeTab === "tags" && !this.state.focus) {
			this.setState({focus: true});
		}
	}

	// Called when the listener detects a change in window height.
	// Write that height to state and triggers a function update
	updateDimension() {
		this.setState({ windowHeight: window.innerHeight });
	}

	// Handles changes to the tags shown based on filtering
	handleFilteredTags(filteredTags) {
		this.setState({
			filteredTags: filteredTags,
		});
	}

	// Change sorting of a list
	changeSort(list, value) {
		if(value) {
			this.setState({
				[list]: value,
			});
		} else {
			this.setState({
				[list]: !this.state[list],
			});
		}
	}

	render() {

		let tagFilter;
		let tagItems;
		let recapItems;

		let smallScreen = window.innerWidth < 576;

		switch (this.props.status) {
			case "LOADING":
				tagItems = <div className="loading-spinner center-vertically">
					<Spinner animation="grow" variant="info" role="status">
						<span className="sr-only">Loading...</span>
					</Spinner>
				</div>
				recapItems = <div className="loading-spinner center-vertically">
					<Spinner animation="grow" variant="info" role="status">
						<span className="sr-only">Loading...</span>
					</Spinner>
				</div>
				break;
			case "LOADED":

				// Create the tag filter component and the tag item list 
				if(!this.props.campaign.tags) {
					//Render nothing if there are no tags
					tagFilter = <div></div>;
					tagItems = <div></div>; 
				} else {

					tagFilter = <TagFilter
									campaign = {this.props.campaign}
									filteredTags = {this.state.filteredTags}
									handleFilteredTags = {this.handleFilteredTags}
									tagSort = {this.state.tagSort}
									focus = {this.state.focus}
								/>

					let sortedKeys = [...this.state.filteredTags]; // Copy list so it can be sorted

					// Reverse keys, based on the current sorting
					if(this.state.tagSort === 2 || this.state.tagSort === 3) {
						sortedKeys.reverse();
					}
					
					// Render tag items
					tagItems = sortedKeys.map((tag) =>
						this.props.campaign.tags[tag] ?
						<TagItem 
							key = {tag}
							tagInfo = {this.props.campaign.tags[tag]}
							isSelected = {this.props.selectedTag === tag}
							handleClick = {() => {
								this.props.handleSelectedTag(tag);
								this.props.handleTransition("slide-to-recaps");
							}}
						/> :
						<></>
					);
				}

				// Create the recap item list
				if(!this.props.selectedTag) {
					recapItems = <div></div>; // No current tag
				} else if(!this.props.tags[this.props.selectedTag]) {
					recapItems = <div></div>; // Current tag doesn't exist?
				} else {
					let recapList = this.props.tags[this.props.selectedTag].recaps;
					let length = this.props.campaign.sessionOrder.length;
					let recapKeys = {};
					
					// Order recap items chronologically
					// First, give each recap item a number for sorting
					// Multiply session order by a large number to guarantee that is counted higher
					// than the recap order, which is added by as a small number
					for(let recapItem in recapList) {
						let session = this.props.campaign.sessions[recapList[recapItem].session];
						let sessionIndex = this.props.campaign.sessionOrder.indexOf(recapList[recapItem].session);
						recapKeys[recapItem] = (length - sessionIndex) * 100000 + session.recapOrder.indexOf(recapItem);
					}
					
					// Then sort keys
					let sortedKeys = Object.keys(recapKeys).sort((a, b) => {				
						return recapKeys[a] - recapKeys[b];
					});

					// Change sorting if specified
					if(this.state.recapSortDescending) {
						sortedKeys.reverse();
					}

					// Render recap items
					recapItems = sortedKeys.map((recapID)=>
						<RecapItem 
							key = {recapID}
							recapID = {recapID}
							recapItem = {recapList[recapID]}
							campaign = {this.props.campaign}
							sessions = {this.props.sessions}
							tags = {this.props.tags}
							selectedTag = {this.props.selectedTag}
							handleCampaign = {this.props.handleCampaign}
							handleSessions = {this.props.handleSessions}
							handleTags = {this.props.handleTags}
							handleSelectedSession = {this.props.handleSelectedSession}
							handleSelectedTag = {this.props.handleSelectedTag}
							handleError = {this.props.handleError}
							campaignRef = {this.props.campaignRef}
							loadCampaign = {this.props.loadCampaign}
						/>
					);
				}
				
				break;
			default:
				tagItems = <p>Failed to load data, please reload the page or check your internet connection.</p>
				break;
		}

		return (
			<>
				<Row className="remove-margin height-100">
					<Col xl={3} md={4} sm={5} xs={12} className="remove-padding height-100">
						<div className="filter-bar filter-bar-width border-bottom border-right">
							{tagFilter}
						</div>
						<div className="border-right tag-list-column">
							<SortArrowsColumn
								status = {this.state.tagSort}
								changeSort = {(value) => this.changeSort("tagSort", value)}
								alphabetical = {true}
							/>
							<div className="item-list remove-scroll-bar">
								<div 
									className="tag-add-button item-add-button" 
									onClick={() => this.setState({ showTagInfo: true})}
								>
									<FontAwesomeIcon icon={faPlus}/>
								</div>
								{tagItems}
							</div>
						</div>
					</Col>
					<Col 
						xl={9} md={8} sm={7} xs={12} 
						className="remove-padding height-100 recaps-column" 
						ref={ref => (this.recapItemColumn = ref)}
						style={this.props.showAlert && smallScreen ? 
							{bottom: "calc(96.5vh - 116px - " + this.props.alertHeight + "px)"} 
							: {}}
					>
						<div ref={ref => (this.tagDescription = ref)}>
							{this.props.selectedTag ? 
								<TagDescription 
									tagID = {this.props.selectedTag}
									tag = {this.props.campaign.tags[this.props.selectedTag]}
									campaign = {this.props.campaign}
									sessions = {this.props.sessions}
									tags = {this.props.tags}
									filteredTags = {this.state.filteredTags}
									handleSessions = {this.props.handleSessions}
									handleTags = {this.props.handleTags}
									handleCampaign = {this.props.handleCampaign}
									handleSelectedTag = {this.props.handleSelectedTag}
									handleFilteredTags = {this.handleFilteredTags}
									updateDimension = {this.updateDimension}
									handleError = {this.props.handleError}
									campaignRef = {this.props.campaignRef}
									loadCampaign = {this.props.loadCampaign}
								/> : null}
						</div>
						<SortArrowsColumn
							status = {this.state.recapSortDescending}
							changeSort = {() => this.changeSort("recapSortDescending", null)}
							alphabetical = {false}
						/>
						<div className="item-list remove-scroll-bar" style={this.state.recapListStyle}>
							{recapItems}
						</div>
					</Col>
				</Row>
				
				<TagInfo 
					show = {this.state.showTagInfo}
					onHide = {() => this.setState({ showTagInfo: false })}
					tags = {this.props.tags}
					campaign = {this.props.campaign}
					handleTags = {this.props.handleTags}
					handleCampaign = {this.props.handleCampaign}
					campaignRef = {this.props.campaignRef}
					edit = {false}
					selectTag = {true}
					tagID = {null}
					handleSelectedTag = {this.props.handleSelectedTag}
					handleError = {this.props.handleError}
					loadCampaign = {this.props.loadCampaign}
				/>
			</>
		)
	}
}

export default withFirebase(TagsPage)