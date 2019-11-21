import React from 'react';
import {Select, MenuItem, FormControl} from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox'
import {Table, TableBody, TableCell, TableRow} from '@material-ui/core';
//import {TableHead} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';


import {isEmpty, DDTinputLabel} from './helperfuns';


export default class SettingsArea extends React.Component {

    contents = () => {

	if (isEmpty(this.props.appState.dbTemplate)) {
	    return(<p>No database selected</p>)
	}

	let enumTypes = [];
	for (let key in this.props.appState.dbTemplate.dbEnums) { enumTypes.push(key); }
	    let groupByOptions = [];
	    groupByOptions.push(<MenuItem key="none" value="none" name="none" >none</MenuItem>);
	for (let fieldName in this.props.appState.dbTemplate.dbFieldTypes) {
	    let fieldType = this.props.appState.dbTemplate.dbFieldTypes[fieldName];
	    if (enumTypes.includes(fieldType)) {
		groupByOptions.push(<MenuItem key={fieldName} value={fieldName} name={fieldName} >{fieldName}</MenuItem>);
	    } // if
	} // for

	/*
		return(<MenuItem key={index} value={enumval} name={enumval}
		       data-index={index} >
		       {enumval}</MenuItem>);

*/


	    let valueIncludeSelect = [];
	    let valueIncludeOptions = [];
	    if (this.props.appState.settings.groupBy !== "none") {
		//valueIncludeOptions

		/* ajatusvirhe: ei tietysti enumin mukaan vaan kentän
		for (let key in this.props.appState.dbTemplate.dbEnums[this.props.appState.settings.groupBy]) {
		    let valueName = this.props.appState.dbTemplate.dbEnums[this.props.appState.settings.groupBy][key];
*/
		for (let fieldName in this.props.appState.dbTemplate.dbFieldTypes) {
		    if (fieldName !== this.props.appState.settings.groupBy) { continue; }
		    
		    let typeName = this.props.appState.dbTemplate.dbFieldTypes[fieldName];

		    console.log("enums "+typeName+"=",this.props.appState.dbTemplate.dbEnums)
		    console.log("enums "+typeName+"=",this.props.appState.dbTemplate.dbEnums[typeName])
		    for (let iind=0; iind<this.props.appState.dbTemplate.dbEnums[typeName].length; iind++) {
			let valueName = this.props.appState.dbTemplate.dbEnums[typeName][iind];
			console.log("enums, value",valueName);

			/*
			 <Checkbox
            checked={state.checkedB}
            onChange={handleChange('checkedB')}
            value="checkedB"
            color="primary"
			    />


			<input type="checkbox" name={valueName} value={valueName}
		    checked={this.props.appState.settings.valueVisibility[valueName]}
		    onChange={this.props.appFuns.toggleVisibility}/>

			    */
			    
		valueIncludeOptions.push(
			<div key={valueName}>

			 <Checkbox
		    checked={this.props.appState.settings.valueVisibility[valueName]}
		    onChange={this.props.appFuns.toggleVisibility}
		    name={valueName} 
		    value={valueName}
            color="primary"
/>		    
			{valueName}
			<br/></div>
		);
		    } // for values
		} // for fields
		
		valueIncludeSelect =
		    <div>
		    <span>include values:</span><br/>
		    {valueIncludeOptions}
		    </div>
		
	    }//if grouped

	/*
		<Select
	    	    name={key}
	    value={this.props.appState.rowUnderUpdate[key]}
	    onChange={this.props.appFuns.changeRowUnderUpdate}>
		{optionTags}
	    </Select>

*/
	    
	return(	    <Paper elevated={5}>

		    <Table><TableBody>
		    <TableRow><TableCell>

		    
		    <Checkbox name="showShared" value="showShared" checked={this.props.appState.settings.showShared} onChange={this.props.appFuns.toggleSharing} color="primary"/>
		    show content shared by other users

		    </TableCell></TableRow>

		    <TableRow><TableCell>
		    <DDTinputLabel>group contents by</DDTinputLabel>		    
		    <FormControl variant="outlined" style={{minWidth:"12em"}}>
		    <Select value={this.props.appState.settings.groupBy}
		    onChange={this.props.appFuns.chooseGroupingField}
		    variant="outlined"
		    >
				{groupByOptions}
		    </Select>
		    </FormControl>
		    		    </TableCell></TableRow>

		    <TableRow><TableCell>
		    {valueIncludeSelect}
		    		    		    </TableCell></TableRow>
		    </TableBody></Table>
</Paper>
		  )	    

    }
    
    render() {	 	
	return(
		<div>

	
	    {    this.contents() }
	    </div>
	)
	

    }
}



