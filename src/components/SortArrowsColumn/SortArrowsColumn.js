import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortNumericDown } from '@fortawesome/free-solid-svg-icons';
import { faSortNumericUpAlt } from '@fortawesome/free-solid-svg-icons';
import { faSortAlphaDown } from '@fortawesome/free-solid-svg-icons';
import { faSortAlphaUpAlt } from '@fortawesome/free-solid-svg-icons';

/*
	This constant holds the column for the sorting arrows for the different list.
	The arrows rendered differes based on if an alphabetical sort is wanted or not
	(which is currently only used for the tag item list).
*/
const SortArrowsColumn = (props) => (
	<div className="center arrow-sort-col">
		{props.alphabetical ?
			<>
				<FontAwesomeIcon 
					icon={faSortNumericUpAlt} 
					onClick={props.status === 1 ? null : () => props.changeSort(1)}
					className={props.status === 1 ? "arrow-sort-active arrow" : "arrow icon"}
				/>
				<FontAwesomeIcon 
					icon={faSortNumericDown}
					onClick={props.status === 2 ? null : () => props.changeSort(2)}
					className={props.status === 2 ? "arrow-sort-active arrow" : "arrow icon"}
				/>
				<FontAwesomeIcon 
					icon={faSortAlphaUpAlt} 
					onClick={props.status === 3 ? null : () => props.changeSort(3)}
					className={props.status === 3 ? "arrow-sort-active arrow" : "arrow icon"}
				/>
				<FontAwesomeIcon 
					icon={faSortAlphaDown}
					onClick={props.status === 4 ? null : () => props.changeSort(4)}
					className={props.status === 4 ? "arrow-sort-active arrow" : "arrow icon"}
				/>
			</>
		:	<>
				<FontAwesomeIcon 
					icon={faSortNumericUpAlt} 
					onClick={props.status ? null : props.changeSort}
					className={props.status ? "arrow-sort-active arrow" : "icon arrow"}
				/>
				<FontAwesomeIcon 
					icon={faSortNumericDown}
					onClick={props.status ? props.changeSort : null}
					className={props.status ? "icon arrow" : "arrow-sort-active arrow"}
				/>
			</>
		}
	</div>
)

export default SortArrowsColumn;