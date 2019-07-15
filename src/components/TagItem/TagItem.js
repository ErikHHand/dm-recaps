import React, { Component } from 'react';


import Card from 'react-bootstrap/Card'


class TagItem extends Component {


	render() {		

		return (
			<Card 
				body 
				className="tag-text text-white" 
				style={{ backgroundColor: this.props.tag.colour}}
				onClick = {this.props.handleClick}
			>
				{this.props.tag.name}
			</Card>
		);
	}
}

export default TagItem