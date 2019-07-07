import React, { Component } from 'react';

import RecapItem from '../RecapItem/RecapItem';
import TagItem from '../TagItem/TagItem';
import NewTag from '../NewTag/NewTag';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
//import Form from 'react-bootstrap/Form'
import Badge from 'react-bootstrap/Badge'

class TagsPage extends Component {

	constructor(props) {
		super(props);

		this.state = {
			showAddWindow: false,
			id: this.props.id,
			currentTag: null,
		};
	}

	render() {

		let recapItems = <div></div>;

		let tagItems;

		let tagsPage = this;

		if(!this.props.campaign.tags) {
			tagItems = <div></div>;
		} else {
			console.log(this.props.campaign.tags);
			
			tagItems = Array.from(Object.keys(this.props.campaign.tags)).map((tag)=>
				<TagItem 
					key = {tag}
					name = {tag}
					tag = {this.props.campaign.tags[tag]}
					click = {() => tagsPage.setState({currentTag: tag})}
				/>
			);
		}

		return (
			<Row>
				<Col md={3}>
					{tagItems}
					<div className="center">
						<Button variant="success" onClick={() => this.setState({ showAddWindow: true })}>New Tag</Button>
					</div>
					<NewTag 
						show = {this.state.showAddWindow}
						onHide = {() => this.setState({ showAddWindow: false })}
						campaign = {this.props.campaign}
						handleCampaign = {this.props.handleCampaign}
						id = {this.state.id}
					/>
				</Col>
				<Col md={9}>
					{recapItems}
				</Col>
			</Row>
		)
	}
}

export default TagsPage