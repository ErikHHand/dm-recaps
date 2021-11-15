import React, { Component } from 'react';

import Badge from 'react-bootstrap/Badge'

import { COLOURS } from '../../constants/colours.js';
import { TEXTCOLOURS } from '../../constants/colours.js';
import { ICONS } from '../../constants/types.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/*
	This class holds the tag item component, found in the list to the
	left on the tags page. This component only holds the layout. Functions
	for editing and deleting can be found in the tag description component. 
*/
class TagItem extends Component {

	render() {	

		let badgeClasses = TEXTCOLOURS[this.props.tagInfo.colour] + " tag-item " +
							(this.props.isSelected ? "tag-item-selected" : "");

		return (
			<Badge
				pill 
				className={badgeClasses}
				style={{ backgroundColor: COLOURS[this.props.tagInfo.colour]}}
				onClick = {this.props.handleClick}
				bg="bullshit"
			>
				<FontAwesomeIcon icon={ICONS[this.props.tagInfo.type]} />
				&nbsp;
				{this.props.tagInfo.name}
			</Badge>
		);
	}
}

export default TagItem