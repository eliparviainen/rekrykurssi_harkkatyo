import React from 'react';
//import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
//import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box'
//import OutlinedInput from '@material-ui/core/OutlinedInput'
//import Button from '@material-ui/core/Button'
import {Select, MenuItem, FormControl} from '@material-ui/core';
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid';

import {isEmpty} from './helperfuns';


export default class ChooseDBarea extends React.Component {

    constructor(props) {
	super(props)
	// this.state = {dBdetails: "", selectText: "(choose database)"};
	this.props.appFuns.consumeMsgFromBackend();
	this.state = {indexInMenu: 0};
    }
    
    readSchema = (event) => {
	this.props.appFuns.readSchema(this.props.appState.dbList[this.state.indexInMenu].dbId)
    }


    setIndex = (event) => {
	this.setState({indexInMenu:event.target.dataset.index});	
    }

    
    render() {


	
	if (isEmpty(this.props.appState.dbList)) {
	    return(<div> No databases available </div>)
	}
	
	let optionTags = [];
	if (!isEmpty(this.props.appState.dbList)) {
	     optionTags = this.props.appState.dbList.map(
	(dbEntry, index) => {
	    return(<MenuItem key={index} value={dbEntry.dbName} name={dbEntry.dbName} data-index={index} onMouseEnter={this.setIndex}>{dbEntry.dbName}</MenuItem>);
	}) // map
	}

    return(
	    <>
	    <Grid container spacing={10}>
	    <Grid item xs={4} >
	    <FormControl variant="outlined" style={{minWidth:"12em"}}>
	    <Select value={this.props.appState.dbList[this.state.indexInMenu].dbName} onChange={this.readSchema}>	    
	    {optionTags}
	</Select>

	</FormControl>
	    </Grid>
   	    <Grid item xs={2}></Grid>
	    <Grid item xs={6}>
	    <Box m={2}> {
		this.props.appState.dbList[this.state.indexInMenu].dbDescription
	    }</Box>
	    </Grid>
	    	    </Grid>

	    <Box mt={2}>
	    <Typography component="span" color="secondary">{this.props.appState.msgFromBackend}</Typography>
	    </Box>


	    </>
    )
	// 
    } 
}


