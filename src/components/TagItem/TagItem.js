import React, { Component } from 'react';

import Badge from 'react-bootstrap/Badge'

import { COLOURS } from '../../constants/colours.js';
import { TEXTCOLOURS } from '../../constants/colours.js';
import { ICONS } from '../../constants/types.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { withFirebase } from '../Firebase/Firebase';
import * as firebase from 'firebase'; // Do not remove

/*
	This class holds the Tag Items on the left side of the Tags Page. 
*/
class TagItem extends Component {

	constructor(props) {
		super(props);
	}

	render() {	

		let badgeClasses = TEXTCOLOURS[this.props.tagInfo.colour] + " tag-item " +
							(this.props.isSelected ? "tag-item-selected" : "");

		return (
			<Badge
				pill 
				className={badgeClasses}
				style={{ backgroundColor: COLOURS[this.props.tagInfo.colour]}}
				onClick = {this.props.handleClick}
			>
				<FontAwesomeIcon icon={ICONS[this.props.tagInfo.type]} />
				&nbsp;
				{this.props.tagInfo.name}
			</Badge>
		);
	}
}

export default withFirebase(TagItem)