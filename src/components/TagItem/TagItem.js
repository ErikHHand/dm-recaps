import React, { Component } from 'react';


import Card from 'react-bootstrap/Card'


class TagItem extends Component {

	constructor(props) {
		super(props);

		
	}

	render() {

		//onClick = {this.props.click}

		return (
			<div>

			
			<Card body className="bg-success text-white tag-text">This is a test</Card>
			<Card body className="bg-info text-white tag-text">Misty Mountains</Card>
			<Card body className="bg-danger text-white tag-text">Tavern in town</Card>
			<Card body className="bg-warning text-white tag-text">Bad Guy</Card>
			<Card body className="bg-dark text-white tag-text">Coolest NPC</Card>

			</div>
		);
	}
}

export default TagItem