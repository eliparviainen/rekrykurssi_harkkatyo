import React from 'react';
import './App.css';
//import OpenCloseArea from './comps/OpenCloseArea';

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
//import List from '@material-ui/core/List'
//import ListItem from '@material-ui/core/ListItem'
//import ListItemText from '@material-ui/core/ListItemText'
import Button from '@material-ui/core/Button'
import InputLabel from '@material-ui/core/InputLabel'
//import Input from '@material-ui/core/Input'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Box from '@material-ui/core/Box'
import {withStyles} from '@material-ui/core'
//import {makeStyles} from '@material-ui/core'

import {ExpansionPanel,ExpansionPanelSummary,ExpansionPanelDetails} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
//import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import {Select, MenuItem, FormControl} from '@material-ui/core';

const DEBUG = true;
const debugstyle = {color: "gray", fontSize: "0.8em", fontStyle:"italic"}


const OK = "ok";
const FORBIDDEN = "forbidden";
const CONFLICT = "conflict";
const NOT_FOUND = "not found";
const SOME_ERROR = "error";


function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}



class ChooseDBarea extends React.Component {

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
    /*
    showDetails = (event) => {
	console.log("focus!", event.target.dataset.index)	
	let indexInMenu = event.target.dataset.index;
	    console.log("showdet",indexInMenu);
	    console.log("showdet",this.props.appState.dbList[indexInMenu])
	this.setState({
	    dBdetails : this.props.appState.dbList[indexInMenu].dbDescription,
	    selectText : this.props.appState.dbList[indexInMenu].dbName
	})
    }
    */

    
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

	console.log("text=",this.state.indexInMenu)
	console.log("lista=",this.props.appState.dbList)
    return(
	    <div>
	    <Grid container spacing={3}>
	    <Grid item xs={4} >
	    <FormControl variant="outlined" style={{minWidth:"10em"}}>
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


	    </div>
    )
	// 
    } 
}


class CreateDBarea extends React.Component {

    
        constructor(props) {
	super(props)
	this.props.appFuns.consumeMsgFromBackend();
	    this.state = {
		dbName: "",
		dbDescription:"",
		dbUserList:"",
		dbFieldTypes: {},
		dbEnums: {},
		newEnumName: "",
		newEnumValues: [],
		newFieldName: "",
		newFieldType: "string",
	}
	}


    zeroState = () => {this.setState(
	    {
		dbName: "",
		dbDescription:"",
		dbUserList:"",
		dbFieldTypes: {},
		dbEnums: {},
		newEnumName: "",
		newEnumValues: [],
		newFieldName: "",
		newFieldType: "string",
	}
	)};

    componentDidMount = () => {
    	// set initial values
	this.zeroState();
    }


    createSchema = () => {

	let info = { dbName: this.state.dbName,
		     dbDescription: this.state.dbDescription,
		     dbUserList: this.state.dbUserList,
		     dbTemplate: {
			 dbFieldTypes: this.state.dbFieldTypes,
			 dbEnums: this.state.dbEnums
		     }
		   }

	console.log("FE create DB ",info)	
	this.props.appFuns.createSchema(info);
	this.zeroState();
	this.props.appFuns.consumeMsgFromBackend();
    }

    cancelCreateSchema = () => {
	this.props.appFuns.cancelCreateSchema();
	this.zeroState();
	this.props.appFuns.consumeMsgFromBackend();
    }


    /*
    		    for (let i=0; i<this.state.dbEnums[key].length; i++) {
			 {this.state.dbEnums[key].map(
			(value) => { return(<span>{value},</span>)})}
			 
    */
    renderExistingEnums = () => {
	//console.log(this.state.dbEnums)
	let enums = [];
	for (let key in this.state.dbEnums) {
	    let valuelist = this.state.dbEnums[key].join(',');
	    enums.push(
		    <TableRow key={key}>
		    <TableCell>{key}</TableCell>
		    <TableCell>{valuelist}
		</TableCell>
		    </TableRow>)
	}
	return(enums)
    }


        renderExistingFields = () => {
	    //console.log(this.state.dbFieldTypes)
	    let enums = [];
	    for (let key in this.state.dbFieldTypes) {
	    enums.push(
		    <TableRow key={key}>
		    <TableCell>{key}</TableCell>
		    <TableCell>{this.state.dbFieldTypes[key]}
		</TableCell>
		    </TableRow>)
	    }
	    return(enums)
    }

    
    changeField = (event) => {
	let newState = this.state;
	newState[event.target.name] = event.target.value;
	this.setState(newState);
//	console.log(this.state)
    }


    changeUserList = (event) => {
	let newState = this.state;
	newState.dbUserList = event.target.value.split(",")	
	this.setState(newState);
    }


    changeEnumName = (event) => {
	let newState = this.state;
	newState.newEnumName = event.target.value;
	this.setState(newState);
    }

    changeEnumValues = (event) => {
	let newState = this.state;
	newState.newEnumValues = event.target.value.split(",")	
	this.setState(newState);
    }


    createEnum = () => {
	let newState = this.state;
	newState.dbEnums[this.state.newEnumName] = this.state.newEnumValues;
	newState.newEnumName="";
	newState.newEnumValues=[];
	this.setState(newState);
    }

    createField = () => {
	let newState = this.state;
	if (this.state.newFieldType==="") { 
	    newState.dbFieldTypes[this.state.newFieldName] = "string"
	} else {
	    newState.dbFieldTypes[this.state.newFieldName] = this.state.newFieldType;
	}
	newState.newFieldName="";
	newState.newFieldType="string";
	this.setState(newState);
//	console.log(this.state)
    }

    renderEnumCreator = (oldEnumsFun) => {
	return(<Paper elevation={5}>
	       <Box p={1} fontWeight="fontWeightBold">
	       
                Custom types
               
	       </Box>
	       <Box p={2}>
	       <Table size="small">
		<TableHead>
		<TableRow>
		<TableCell title="e.g. Quality rating"> Type name </TableCell>
		<TableCell title="e.g. Very good, Average, Nonsense"> Comma-separated values (order determines rendering order) </TableCell><TableCell></TableCell>
		</TableRow>
		</TableHead>
	       <TableBody>
	       {oldEnumsFun()}
		<TableRow>
		<TableCell><OutlinedInput type="text" name="newEnumName" value={this.state.newEnumName} onChange={this.changeEnumName}/></TableCell>
		<TableCell><OutlinedInput type="text" name="newEnumValues" value={this.state.newEnumValues} onChange={this.changeEnumValues}/></TableCell>
	       <TableCell>
	       <Button onClick={this.createEnum} variant="outlined" color="primary" size="small" disabled={(isEmpty(this.state.newEnumName)||isEmpty(this.state.newEnumValues))}>Define a new type</Button>
	      
	       </TableCell>
		</TableRow>
	       </TableBody></Table>
	       </Box>
	       </Paper>
	)
    }





    renderFieldCreator = (oldFieldsFun) => {

	let fieldTypeOptions = [];
	fieldTypeOptions.push(<MenuItem key="string" value="string">string</MenuItem>)
	fieldTypeOptions.push(<MenuItem key="text" value="text">text</MenuItem>)
	fieldTypeOptions.push(<MenuItem key="url" value="url">URL</MenuItem>)
	fieldTypeOptions.push(<MenuItem key="number" value="number">number</MenuItem>)
	for (let typeName in this.state.dbEnums) {
	    fieldTypeOptions.push(<MenuItem key={typeName} value={typeName}>{typeName}</MenuItem>)
	}
	

	console.log("BUGI: alkuarvo select:issä näkyy vain ekaa kenttää lisätessä, reset puuttuu");
	
	return(
		<Paper elevation={5}>
	       <Box p={2} fontWeight="fontWeightBold">
	       
            Fields
               
	    </Box>
			       <Box p={2}>
	       <Table size="small">
				<TableHead>
		<TableRow>
		<TableCell title="What would you expect to input in a field called 'Field name'?"> Field name </TableCell>
		<TableCell title="Field type. Custom types you define will be added here."> Field type </TableCell>
				<TableCell> </TableCell>
		</TableRow>
		</TableHead>
		<TableBody>
		{oldFieldsFun()}
		<TableRow>
		<TableCell><OutlinedInput type="text" name="newFieldName" value={this.state.newFieldName} onChange={this.changeField}/></TableCell>
		<TableCell>
		<FormControl variant="outlined" style={{minWidth:"10em"}}>
		<Select name="newFieldType" value={this.state.newFieldType} onChange={this.changeField} >
		{fieldTypeOptions}
	    </Select>
		</FormControl>
		</TableCell>
		<TableCell><Button onClick={this.createField} variant="outlined" size="small" color="primary"
	    disabled={(isEmpty(this.state.newFieldName)||isEmpty(this.state.newFieldType))}
		>Add new field</Button>
		</TableCell>
		</TableRow>
		</TableBody></Table>
		</Box>
		</Paper>
	)
    }




    
    render() {


	console.log("BEmsg=",this.props.appState.msgFromBackend)

	
	    return(
		    
		    <div>
		    
		    

		
		    <p>
		    You work in admin mode now. No undos, no confirmation questions.
		    If you mess it up, cancel and start afresh.
		    </p>
		    <hr/>

				
		    <Typography variant="h6">Create a database</Typography>
		    <br/>


		    <Paper elevation={5}>

		       <Box p={2} fontWeight="fontWeightBold">
	       
		Description
               
		</Box>
		    <Box p={2}>


		    <Table size="small">
		    <TableHead>
		<TableRow>
		<TableCell title="Database name, preferably shortish."> Name </TableCell>
		<TableCell title="Free-form text that tells something about the contents or purpose of your database."> Description </TableCell>
		    <TableCell title="List users who, besides yourself, can access the database. Cannot be changed later. Leave empty for public databases."> Comma-separated user list (leave empty if anybody can use) </TableCell>
		</TableRow>
		</TableHead>
		<TableBody>
		<TableRow>
		<TableCell><OutlinedInput variant="outlined" type="text" name="dbName" value={this.state.dbName} onChange={this.changeField}/></TableCell>
		    <TableCell><OutlinedInput type="text" name="dbDescription" multiline={true} value={this.state.dbDescription} onChange={this.changeField}/></TableCell>
		    <TableCell><OutlinedInput type="text" name="dbUserList" value={this.state.dbUserList} onChange={this.changeUserList}/></TableCell>
		</TableRow>
		</TableBody></Table>
    			       </Box>
		  
		</Paper>

		<br/>
		

		    {this.renderEnumCreator(this.renderExistingEnums)}

		    <br/>


		    {this.renderFieldCreator(this.renderExistingFields)}
		    <Box mt={4} mb={4}>


		    <Grid container>
		    <Grid item xs={3}>
		    <Button color="primary" variant="contained" size="large" onClick={this.cancelCreateSchema}>Cancel</Button>
		    </Grid>
		    <Grid item xs={3}>
		    <Button color="primary" variant="contained" size="large"  disabled={isEmpty(this.state.dbFieldTypes)} onClick={this.createSchema}>Create database</Button>
		    </Grid>		    </Grid>

				</Box>


		    <Box mt={2}>
		    <Typography component="span" color="secondary">{this.props.appState.msgFromBackend}</Typography>
		    </Box>


		    <hr/>
		    
		    <Typography variant="h6">Delete a database</Typography>
		    <p>
		    Apologies, this is a course project work, not a full-scale application.<br/>
		    Databases can only be deleted by hand.
		    Contact a super-admin who can access the database server.
		    </p>
		    </div>	  
	    )
	    

    } // render

    /*

*/
    
}




class SettingsArea extends React.Component {
    render() {

	
	if (!this.props.appState.dbId) {
	    if (DEBUG) {
		return(<div style={debugstyle}> debug: SettingsArea ei näy koska tietokantaa ei ole valittu </div>)	    }	    
	    return([])	    
	}



	return(
	    <div> SettingsArea </div>
	)
    }

}


/*
MENOSSA TÄSSÄ
KESKEN
enum-tyyppien käsittely (edit/view)
laita paikalleen funktiokutsut
alota kutsua backendia
kato kannalla jossa kaikki kenttätyypit
*/

class AddRowArea extends React.Component {

    

    render() {

	console.log("PUUTTUU: kun kanta vaihtuu AddRowArean ollessa auki, päivittyy huonosti (joku tilannollaus oltava)")
	
	console.log("add row template",	this.props.appState.dbTemplate)

	
		
		    return(
<div>	    
			  
			    <Row mode="add" 
			appState={this.props.appState}
		   appFuns={this.props.appFuns}
			    />
			   
			    <Box mt={2}>
	    <Typography component="span" color="secondary">{this.props.appState.msgFromBackend}</Typography>
	    </Box>
		

	    </div>
	)


    }

    
}



//import StateHelper from './StateHelper';

// ============================================================
export class RowContents  extends React.Component 
// ============================================================
{

    constructor(props) {
	super(props);

	this.state = {indexInMenu: 0}

	console.log("RowContents constr",this.state)
    }

    static emptyRow(template) {
	// this.props.appState.dbTemplate
	let newRow = {};
	let enumTypes = [];
	for (let key in template.dbEnums) { enumTypes.push(key); }
	console.log("tyhjän rivin template",template)
	console.log("tyhjän rivin template",template.dbFieldTypes)
	for (let key in template.dbFieldTypes)
	{
	    switch (template.dbFieldTypes[key]) {
	    case "string": newRow[key]="(string)"; break;
	    case "text": newRow[key]="(text)"; break;
	    case "url": newRow[key]="(URL)"; break;
	    case "number":newRow[key]=0; break;
	    default:
		// implicit assumption: everything not listed above is enum
		let ind = enumTypes.indexOf(template.dbFieldTypes[key]);
		console.log("tyhjä rivi indexof=",ind);
		if (ind>=0) {
		    let typeName = enumTypes[ind];
		    console.log("tyhjä rivi name=",typeName);
		    newRow[key]=template.dbEnums[typeName][0]; break;
		} else {
		    newRow[key]="(no value)";
		}
	    }//switch
	}//for

	console.log("tyhjä rivi=",newRow);
	return(newRow);
    }


    setIndex = (event) => {
	this.setState({indexInMenu:event.target.dataset.index});	
    }


    renderSimpleInput = (mode, key, index, typeTag, multiline) => {
	if (mode === "edit" || mode === "add") {
	    if (!multiline) { multiline=false; }
	    if (typeTag==="url") { typeTag="string" }

	    console.log("renderSimpleInput",key)
	    console.log("renderSimpleInput",this.props.appState.rowUnderUpdate[key])

	    // Initially, rowUnderUpdate comes here as an empty object so input
	    // values are undefined. Changing from unefined to defined later is
	    // not tolerated. So don't render undefineds.
	    if (this.props.appState.rowUnderUpdate[key]===undefined) {
		console.log("ongelmakenttiä ei renderöidä");
		return(<TableRow key={index}>
		       <TableCell>
		       </TableCell></TableRow>)
	    }

	    
	    	return(
				<TableRow key={index}>
			    
			    <TableCell>
			    <DDTinputLabel>{key}</DDTinputLabel>
		<OutlinedInput type={typeTag}
	    name={key}
	    multiline={multiline}
			value={this.props.appState.rowUnderUpdate[key]}
			onChange={this.props.appFuns.changeRow} />
			    </TableCell>
			    </TableRow>
	)
	} // edit/add
	else {

	    let st = (typeTag==="url")?{"fontStyle":"italic"}:{};
	    return( <TableRow key={index}><TableCell style={st} multiline={multiline}>&nbsp;{this.props.appState.rowUnderUpdate[key]}</TableCell></TableRow>)
	} // view
    }


    /*
    changeEnum = (fieldName, value) => {
	let newVals = this.state.enumVals;
	newVals[fieldName]=value;
	this.setState({enumVals:newVals});
    }
    */
			
    renderEnumInput = (mode, key, index, enumName) => {

	// lyhenne
	let templateEnums = this.props.appState.dbTemplate.dbEnums;
	
	console.log('renderEnumInput enter');
	
	if (mode === "edit" || mode === "add") {

	    /*
	    console.log('renderEnumInput name', enumName);
	    console.log('renderEnumInput all-enums', templateEnums);
	    console.log('renderEnumInput enum[name]', templateEnums[enumName]);
*/
	    
	let optionTags = templateEnums[enumName].map(
	    (enumval, index) => {
		return(<MenuItem key={index} value={enumval} name={enumval}
		       data-index={index} onMouseEnter={this.setIndex}>
		       {enumval}</MenuItem>);
	    }) // map

	    
	    //console.log( optionTags );
	    // onchange={(event)=>this.changeEnum(enumName, event.target.value)}>

	    console.log("renderEnum, value", this.props.appState.rowUnderUpdate[key]);

	    if ((!this.props.appState.rowUnderUpdate[key])||isEmpty(optionTags)) {
//		console.log("ongelmaselektiä ei renderöidä");
		return(<TableRow key={index}>
		       <TableCell>
		       </TableCell></TableRow>)
	    }

//	    console.log("ongelmaselect renderöidään");
	return(
	    	<TableRow key={index}>
			    
		<TableCell>
		<DDTinputLabel>{key}</DDTinputLabel>

		<FormControl variant="outlined" style={{minWidth:"10em"}}>
		<Select
	    	    name={key}
	    value={this.props.appState.rowUnderUpdate[key]}
	    onChange={this.props.appFuns.changeRow}>
		{optionTags}
	    </Select>
		</FormControl>
			    </TableCell>
		</TableRow>
	)
	} // add/edit
	else {
	
	return(
	    		<TableRow key={index}>			    
		<TableCell>{this.props.appState.rowUnderUpdate[key]}			 
			    </TableCell>
		</TableRow>
	) // view
		    
    }
    }

    /*
    componentDidMount = () => {
		let enumVals={};
	if (!isEmpty(this.props.appState.dbTemplate.dbEnums)) {	    
	this.props.appState.dbTemplate.dbEnums.forEach(
	    (key) => { enumVals[key]=this.props.appState.dbTemplate.dbEnums[key][0]} );
	}
	this.setState({enumVals:enumVals});
	console.log("rowcont render",enumVals);
    }
*/
    
    render() {

	console.log("RowCont props.jsonrow",this.props.appState.rowUnderUpdate);
	
	let fieldnames = [];
	let enumTypes = [];

	/*
	console.log("RowCedit jsonrow",this.props.appState.rowUnderUpdate)
	console.log("RowCedit template",this.props.appState.dbTemplate)
*/
	
	for (let key in this.props.appState.dbTemplate.dbFieldTypes) { fieldnames.push(key); }

//	console.log("RowCedit template enums",this.props.appState.dbTemplate.dbEnums)
	for (let key in this.props.appState.dbTemplate.dbEnums) { enumTypes.push(key); }
	
//	console.log("enums=",enumTypes)
	
	
//	console.log("RowCedit kentät",fieldnames)

	let wideElems = [];
	let narrowElems = [];

	
	fieldnames.forEach( (key, index) => {

	    
		console.log("RowCedit key-"+index,key)
		console.log("RowCedit type-"+index,this.props.appState.dbTemplate.dbFieldTypes[key])

		
		//this.wrapWithTitle(key, () => {
		switch (this.props.appState.dbTemplate.dbFieldTypes[key]) {
		case "string":
		    wideElems.push(this.renderSimpleInput(this.props.mode, key, index, "text"));
		    break;

		case "url":
		    wideElems.push(this.renderSimpleInput(this.props.mode, key, index, "url"));
		    break;

		case "text":
		    let multiline=true;
		    wideElems.push(this.renderSimpleInput(this.props.mode, key, index, "text", multiline));
		    break;
		    			
		case "number":
		    console.log("kutsuu renderSimple (nro)")


		    narrowElems.push(this.renderSimpleInput(this.props.mode, key, index, "number"));
		    console.log("narrow=",narrowElems)
		    break;
		    
		default:


		    console.log("RowCedit, enumTypes",enumTypes)
		    console.log("RowCedit, enumTypes, sisältäkö: ",this.props.appState.dbTemplate.dbFieldTypes[key])
		    
		    if (enumTypes.includes(this.props.appState.dbTemplate.dbFieldTypes[key])) {
			
			console.log("RowCedit, löytyi enumtyyppi");
			console.log("if ",this.props.appState.dbTemplate.dbFieldTypes[key])


			let enumName = this.props.appState.dbTemplate.dbFieldTypes[key];


			//console.log("kutsuu renderEnum",this.props.appState.rowUnderUpdate[key])
			
			
			narrowElems.push(this.renderEnumInput(this.props.mode, key, index, enumName));

			//console.log("narrow=",narrowElems)
			
		    } // enum-tyyppi
		    else {
			console.log("row edit/add: unknown field type, skip");
		    }
		    break;
		} // switch
		//}) // titleWrap			     
	    } //map:n fun	     
	) // map


	
	return( <Table size="small">
		<TableBody>
		<TableRow><TableCell>
		{wideElems}
		</TableCell>		
		<TableCell>
		{narrowElems}
		</TableCell></TableRow>
		</TableBody>
	       </Table>
	      )
    

    }

}

// ============================================================
 class RowControls extends React.Component
// ============================================================
{
    renderViewControls = () => {

	
	if (this.props.appState.rowUnderUpdate._owner === this.props.appState.userId) {
	    
	    return(
		    <TableCell>
		    <Button onClick={this.props.toEdit} variant="outlined" color="primary" size="small">Edit</Button>  
		    <Button onClick={this.props.toRemove} variant="outlined" color="primary" size="small">Remove</Button>
		    </TableCell>
	    )
	
	} else {
	    return(
		    <div className="sharingInfo"> Shared by another user<br/> (no editing) </div>
	    )
	}


    }


    renderEditControls = () => {


	return(
	    <TableCell>
		    <Button onClick={()=>{this.props.sendUpEdits(); this.props.finishEdit(); }} variant="outlined" color="primary" size="small">Save</Button>  
		    <Button onClick={this.props.finishEdit} variant="outlined" color="primary" size="small">Discard edits</Button>
		    </TableCell>
	
)
    }

    
        renderAddControls = () => {
	    

	    return(
		    <TableCell>
		   <p className="KESKEN"> PUUTTUU: select:ien arvoja ei kirjata minnekään, kantaan menee aina eka arvo </p>

		    <Button onClick={()=>{this.props.sendUpEdits(); this.props.finishEdit(); }} variant="outlined" color="primary" size="small">Add</Button>  
		    <Button onClick={this.props.finishEdit} variant="outlined" color="primary" size="small">Cancel</Button>
		    </TableCell>


)
    }


    render() {
	switch (this.props.mode) {
	case "edit":
	    return(this.renderEditControls())
	case "add":
	    return(this.renderAddControls())
	default:
	    return(this.renderViewControls())
	    	} // switch
    }
}



//class RowRemove extends React.Component {}

export class Row extends React.Component {

// dbTemplate={this.props.appState.dbTemplate}
    
    constructor(props) {
	super(props)
	this.state = { mode: this.props.mode,
		     }
    }


    // {(info) => {this.props.sendUpDBchange("update", info)}}
        sendUpEdits = () => {
	    this.props.sendUpDBchange("update",this.state.jsonrow);
    }
    
    sendUpRemove = () => {
	this.props.sendUpDBchange('delete',this.state.jsonrow._id);
	console.log('sendUpEdits Row: lähetä remove ylöspäin',this.state.jsonrow);
    }

    sendUpCreate = () => {
	this.props.sendUpDBchange('create',this.state.jsonrow);
    }



    
    toEditMode = () => { this.setState({mode:"edit"}) }
    toRemoveMode = () => { this.setState({mode:"remove"}) }
    toViewMode = () => { this.setState({mode:"view"}) }
    toAddMode = () => { this.setState({mode:"add"}) }

    
    renderRemoveConfirm = () => {
	return(
	    <div className="removeConfirm">
	    <Table><TableBody><TableRow><TableCell>
		<RowContents mode="view"
	    appState={this.props.appState}
		   appFuns={this.props.appFuns}
		    />
	    </TableCell>
	    <TableCell>
	    <div><Button text="Confirm remove" onClick={()=>{this.sendUpRemove(); this.props.finishRemove(); }}/></div>
	    <div><Button text="Cancel remove" onClick={this.props.finishRemove}/></div>
	    </TableCell>	       
	    </TableRow></TableBody></Table>

	</div>
    )
    }
    
    /*
    componentDidMount = () => {
	this.setState({jsonrow: this.props.appState.rowUnderUpdate});
    }
*/
    
    render() {



	console.log("Row:",this.state.mode)

	switch (this.state.mode) {
	case "add":

	    console.log("Row-tag, mode=add, props.jsonrow",this.props.appState.rowUnderUpdate)
	    //console.log("Row-tag, mode=add, state.jsonrow",this.state.jsonrow)
	    
	    return(
		    <Table><TableBody><TableRow>
		    <RowContents mode="add"
		appState={this.props.appState}
		appFuns={this.props.appFuns}
		    />

		    <RowControls mode="add"
		appState={this.props.appState}
		   appFuns={this.props.appFuns}
		   />
</TableRow></TableBody></Table>
			  )
	    

	case "edit":

	    return(<Table><TableBody><TableRow><TableCell>
		   <RowContents mode="edit"
		   appState={this.props.appState}
		   appFuns={this.props.appFuns}
		   />
		   <p className="KESKEN"> BUGI: nrokenttään ei voi kirj numeroa; nrokentän muutettu arvo ei näy ainakaan oikein</p>
		   </TableCell><TableCell>
		   <RowControls mode="edit"
		   appState={this.props.appState}
		   appFuns={this.props.appFuns}
		   />
		   </TableCell></TableRow></TableBody></Table>
	    )

	    

	case "remove":

	    return(
			    <div className="removeConfirm">
		    <Table><TableBody><TableRow><TableCell>
		    <RowContents mode="view"
			    appState={this.props.appState}
	    appFuns={this.props.appFuns}
/>
	    </TableCell>
	    <TableCell>
		    <div><Button text="Confirm remove" onClick={()=>{this.sendUpRemove(); this.toViewMode(); }}/></div>
	    <div><Button text="Cancel remove" onClick={this.toViewMode}/></div>
	    </TableCell>	       
	    </TableRow></TableBody></Table>

	</div>
	   	    
	    )

	    

	default:

	return(
		<div className="KESKEN">
		<Table><TableBody><TableRow>
		<TableCell>
		<RowContents mode="view"
	    appState={this.props.appState}
	    appFuns={this.props.appFuns}
		/>
		</TableCell>
		<TableCell>
		<RowControls mode="view"
	    	    appState={this.props.appState}
	    appFuns={this.props.appFuns}
		/>
	       </TableCell>
		</TableRow></TableBody></Table>
		</div>
	)

	    

	} // switch


    } // render
   
}


class ContentsArea extends React.Component {

    

    
    //inEditMode

    timestampSortDesc = (a,b) => {
    if(a._timestamp < b._timestamp) return 1;
    if(a._timestamp > b._timestamp) return -1;
    return 0;
    }


    
    
    render() {

	/* aina aikajärjestys */
	this.props.appState.dbRows.sort(this.timestampSortDesc);

	let rows = [];
	if (this.props.appState.settings.groupBy === "none") {

//	    console.log("no group")
	    
	    rows = this.props.appState.dbRows.map(
	    (dbrow,index) => {

		//console.log("ContentArea:",dbrow)

		
		if (this.props.appState.settings.showShared || dbrow._owner === this.props.appState.userId) {
		return(		    
			<Row key={dbrow._id} mode="view"
		    dbTemplate={this.props.appState.dbTemplate}
		    jsonrow={dbrow}
		    userId={this.props.appState.userId}
		    sendUpDBchange={this.props.sendUpDBchange}
			/>
		)} else { return([]) }
	    }) // map
	} // if no grouping
	else {
	    console.log("group")
	    rows = [];
	    for (let groupingVariableValue in this.props.appState.settings.valueVisibility) {
		if (this.props.appState.settings.valueVisibility[groupingVariableValue]) {

		    /* käy aina läpi koko tietokannan :( */
		    let rows2 = this.props.appState.dbRows.map(
			(dbrow,index) => {

			    if (dbrow[this.props.appState.settings.groupBy]===groupingVariableValue) {

				if (this.props.appState.settings.showShared || dbrow._owner === this.props.appState.userId) {
				return(
				    <Row key={dbrow._id} mode="view"
				dbTemplate={this.props.appState.dbTemplate}
				jsonrow={dbrow}
				    userId={this.props.appState.userId}
				sendUpDBchange={this.props.sendUpDBchange}
					/>
				) } else {return([])}
			    }
			
			    
			    //console.log("x")
			    //return(<div key={index} className="groupTitle">{groupingVariableValue}</div>);
			    //   return(<div key={index}>x</div>)
			    return([])
			});


		    rows.push(
			    <div key={groupingVariableValue}>
			    <div className="groupTitle">{groupingVariableValue}</div>
			    <div className="groupContentsBox">
			    {rows2}
			    </div>
			    </div>
		    );
		    
	    } // if
	    } // for
	}

//	console.log('contents',rows)
	
	return(
		<div>
		
		<p className="KESKEN"> PUUTTUU: tyhjien kenttien renderöinti viemään tilaa (ui-kirjasto tehnee?) </p>
		<p className="KESKEN"> PUUTTUU: rivin merkkaaminen jaetuksi/yksityiseksi</p>
		{rows}
	    </div>
	)
    }

}


const DDTinputLabel= withStyles({
  root: {
      color: "text.secondary",
      fontSize: "0.8em"
  },
})(InputLabel);


// color and variant cannot be set here
const DDTbutton= withStyles({
  root: {
      margin: "1.5em"
  },
})(Button);

/*
const DDTerrorBox= withStyles({
  root: {
      color: "error.main",
      fontSize: "0.7em",
      padding: "1em",
  },
  label: {
    textTransform: 'none',
  },
})(Box);
*/


/*
const acceptDiscardButtons = (cancelText, cancelFun, acceptText, acceptFun, disableCond) => {
    return(		<Box m={2}>
			<DDTbutton color="primary" variant="contained" size="large" onClick={cancelFun}>{cancelText}</DDTbutton>
			<DDTbutton color="primary" variant="contained" size="large"  disabled={disableCond} onClick={acceptFun}>{acceptText}</DDTbutton>
			</Box>)
}
*/

class LoginPage extends React.Component {

    constructor(props) {
	super(props);
	this.props.appFuns.consumeMsgFromBackend();
	this.state = {userName: "", password: "",buttonDisabled:true}
    }
  
    change = (event) => {
        let state = this.state;
        state[event.target.name] = event.target.value;
        this.setState(state);
	let hasData = (this.state.userName !== "" && this.state.password !== "");
	this.setState({buttonDisabled: !hasData});
	this.props.appFuns.consumeMsgFromBackend();
    }

    // field changed clear msgFromBackend, but
    // buttons must clear it also since after an error a new login
    // can be attempted without changing the fields  
    clickOk = () => {
	let buttonFun = (this.props.action==="signup")?this.props.appFuns.finalizeSignUp:this.props.appFuns.finalizeSignIn;
	this.props.appFuns.consumeMsgFromBackend();
	buttonFun(this.state.userName, this.state.password);
    }


    clickCancel = () => {
	this.props.appFuns.consumeMsgFromBackend();
	this.props.appFuns.cancelSignUpIn();
    }

    render() {
	let buttonName = (this.props.action==="signup")?"Sign up":"Sign in";

	return(
		<div>
		<Typography component="div" align="center">

		<Box m={2} color="error.main" fontSize="0.7em">
		<p>{this.props.appState.msgFromBackend}</p>
		</Box>
		<Box m={2}>
		<DDTinputLabel>Username</DDTinputLabel>
			    	<Box m={1}>
		<OutlinedInput m={2} type="string" margin="dense" name="userName" value={this.state.userName} onChange={this.change}/>
		</Box>		</Box>

		
	    	<Box m={2}>
		<DDTinputLabel>Password</DDTinputLabel>
					    	<Box m={1}>
		<OutlinedInput type="password" margin="dense" name="password" value={this.state.password} onChange={this.change}/>
		</Box>		</Box>

	    <Box m={2}>
		<DDTbutton color="primary" variant="contained" size="large" onClick={this.clickCancel}>Cancel</DDTbutton>
		<DDTbutton color="primary" variant="contained" size="large"  disabled={this.state.buttonDisabled} onClick={this.clickOk}>{buttonName}</DDTbutton>
		</Box>
		</Typography>

	    </div>
	)
    }   
}

    /*
		<Box m={2}>
		<DDTbutton color="primary" variant="outlined" onClick={this.props.appFuns.cancelSignUpIn}>Cancel</DDTbutton>
		<DDTbutton color="primary" variant="outlined" disabled={this.state.buttonDisabled} onClick={()=>{buttonFun(this.state.userName, this.state.password)}}>{buttonName}</DDTbutton>

*/

class NavBar extends React.Component {

    signInOptions = () => {
	if ((this.props.appState.userRole !== "editor") && (this.props.appState.userRole !== "owner")) {

	    return(<div>
		   <Button color="inherit" onClick={this.props.appFuns.initiateSignUp}>Sign-up</Button>
		   <Button color="inherit" onClick={this.props.appFuns.initiateSignIn}>Sign-in</Button>
		   </div>
		  )

	} else {
	    return(
		    <Button color="inherit" onClick={this.props.appFuns.signOut}>Sign-out</Button>
		   )
	    
	}
    }
    render() {
	return(
		<div>
		<AppBar position="static">
		<Toolbar>
                <Typography type="title" style={{ flex: 1 }}>
		<span className="logo">DDT</span> 
		<span>Databases for Daily Topics</span>
		</Typography>		
		{this.signInOptions()}	           
            </Toolbar>
        </AppBar>
        </div>
	)
    }   
}



/*
const accordeonStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
})); 

const accordeonClasses = accordeonStyles();
*/

class Routes {
    static signout(userId) { return('/epdb/user/signout/'+userId); }
    static signup() { return('/epdb/user/signup'); }
    static signin() { return('/epdb/user/signin'); }

    static createSchema(userId) { return('/epdb/structure/'+userId); }
    static readSchema(userId, dbId) { return('/epdb/structure/'+userId+"/"+dbId); }
    static readAllSchemas(userId) { return('/epdb/structure/'+userId); }
    static updateSchema(userId, dbId) { throw new Error("NOT IMPLEMENTED: edit database") };
    static deleteSchema(userId, dbId) { throw new Error("NOT IMPLEMENTED: delete database") };
    
    static createRow(userId, dbId) { return('/epdb/content/'+userId+"/"+dbId); }
    // static readRow(userId, dbId, rowId) { return('/epdb/content/'+userId+"/"+dbId+"/"+rowId); }
    static readAllRows(userId, dbId) { return('/epdb/content/'+userId+"/"+dbId); }
    static updateRow(userId, dbId, rowId) { return('/epdb/content/'+userId+"/"+dbId+"/"+rowId); }
    static deleteRow(userId, dbId, rowId) { return('/epdb/content/'+userId+"/"+dbId+"/"+rowId); }
}

class App extends React.Component {


    //======================================================================
    constructor(props) {
	super(props)

	// create variables
	this.state = {
	    pageState: "",
	    userId: 0,
	    userName: "",
	    sessionToken: "",
	    userRole: "",
	    dbList: [],
	    dbId: 0,
	    dbName: "",
	    dbDescription: "",
	    dbTemplate: {},
	    dbRows: [],
	    msgFromBackend: "",
	    settings: {},
	    rowUnderUpdate: {},
	}

    } // constr

    //======================================================================


    componentDidMount = () => {
    	// set initial values
	this.zeroState();
	this.readAllSchemas();
    }


    zeroState = () => {this.setState(
	{
	    pageState: "browse",
	    userId: 0,
	    userName: "",
	    sessionToken: "",
	    userRole: "visitor",
	    dbList: [],
	    dbId: 0,
	    dbName: "",
	    dbDescription: "",
	    dbRows: [],
	    dbTemplate: {},
	    msgFromBackend: "",
	    settings: {groupBy: "none", showShared: true },
	    rowUnderUpdate: {},
	})};
    
    appToBrowseState = () => { this.setState({pageState: "browse"}) }
    appToSignUpState = () => { this.setState({pageState: "signup"}) }
    appToSignInState = () => { this.setState({pageState: "signin"}) }


    userIntoVisitor = () => { this.setState({userRole: "visitor",
					   userId: 0,
					   userName: "",
					   sessionToken: "",
					  }) }
    userIntoEditor = () => { this.setState({userRole: "editor"}) }

    // owner role does not currently differ from editor role
    // as database edit and delete have not been implemented
    userIntoOwner = () => { this.setState({userRole: "owner"}) }


    
    setMsgFromBackend = (msg) => {
	this.setState({msgFromBackend:msg});
    }

    consumeMsgFromBackend = (msg) => {
	this.setState({msgFromBackend:""});
    }


    
    changeRow = (event) => {
	console.log(" changeRow",event);
	let newrow = this.state.rowUnderUpdate;
	newrow[event.target.name]=event.target.value;
	this.setState({rowUnderUpdate: newrow});
	
    }


  //======================================================================
    fetchAndProcess = (path, req, logname, gotDataFun) => {

	console.log("fetch req",req)
	if (req.mode==="cors")
	{
	    console.log("fetchAndProcess: "+logname+" HUOM cors-moodi päällä");
	}

	fetch(path,req)          
            .then( (response) => {

		switch (response.status) {
		case 200:
                    response.json().then( (data) => { gotDataFun(data, OK) } )
			.catch( (error) => {
			    console.log(logname+": Failed to handle JSON: "+error);
			    gotDataFun([], SOME_ERROR)
			})
		    break
		case 409:
		    console.log(logname+": Server says non-ok status: "+response.status);
		    gotDataFun([], CONFLICT)
		    break
		case 403:
		    console.log(logname+": Server says non-ok status: "+response.status);
		    gotDataFun([], FORBIDDEN)
		    break
		case 404:
		    console.log(logname+": Server says non-ok status: "+response.status);
		    gotDataFun([], NOT_FOUND)
		    break		    
		default:
		    gotDataFun([], SOME_ERROR)
		    break;
		}
            }) // then		 
            .catch( (error) =>
                    {
			console.log(logname+": Server says error: "+error);
			gotDataFun([], SOME_ERROR)
		    }
                  ); 
    }

    //======================================================================
    
    makeReq = () => {
	let req = {
	    mode: "cors",
	    headers: {"Content-type":"application/json",
		      "token":this.state.sessionToken}
	}
	return(req)
    }
    
    makeGetReq = () => {
	let req = this.makeReq();
	req["method"]="GET";
	return req;
    }

    makeDeleteReq = () => {
	let req = this.makeReq();
	req["method"]="DELETE";
	return req;
    }

    makePutReq = (info) => {
	let req = this.makeReq();
	req["method"]="PUT";
	req["body"]=JSON.stringify(info);
	return req
    }

    makePostReq = (info) => {
	console.log("makePostReq ",info)
	let req = this.makeReq();
	req["method"]="POST";
	req["body"]=JSON.stringify(info);
	return req
    }

    
    
    //======================================================================
    
    initiateSignUp = () => {
	this.appToSignUpState();
    }

    initiateSignIn = () => {
	this.appToSignInState();
    }

    cancelSignUpIn = () => {
	this.appToBrowseState();
    }

    signOut = () => {

	let req = this.makePostReq({"userId": this.state.userId}); 

	console.log("sigout, req", req);
	this.fetchAndProcess(Routes.signout(this.state.userId), req, "App.js/signOut",
			     (data, status)=>{
				 console.log("signed out with status", status);
				 // In principle, a user could continue using a public database after signout,
				 // but keeping track of this is complicated. Always start from an initial state.
				 this.zeroState();
			     }) // fetch	
	this.userIntoVisitor();	
	this.appToBrowseState();
    }


    finalizeSignUp = (userName, password) => {	
        let req = this.makePostReq({"userName": userName, "password":password});

	console.log("finalizeSignUp, req", req);
	this.fetchAndProcess(Routes.signup(), req, "App.js/finalizeSignIn",
			     (data, status)=>{
				 switch (status) {				 
				 case OK: 
				     console.log("finalizeSignUp onnistui, logataan sisään");
				     this.finalizeSignIn(userName, password);
				     break;
				 case CONFLICT:				     				     
				     this.setMsgFromBackend("Username is taken. Please choose another one.");
				     break;
				 default:
				     this.setMsgFromBackend("Could not sign up. We don't know why.");
				     break;
				 } // switch
			     }) // fetch	
    }

    
    finalizeSignIn = (userName, password) => {

	console.log("KESKEN: mikä vain reload loggaa ulos koska tila ei säily, lisää sessionstorage");
	
        let req = this.makePostReq({"userName": userName, "password":password});

	console.log("finalizeSignIn, req", req);
	this.fetchAndProcess(Routes.signin(), req, "App.js/finalizeSignIn",
			     (data, status)=>{
				 switch (status) {				 
				 case OK:
				     this.setState({userId:data.userId, sessionToken:data.sessionToken})
				     this.userIntoEditor();
				     console.log("KESKEN: toteuta editor/owner-valinta tietokantaa valitessa")
				     this.appToBrowseState();
				     this.readAllSchemas();
				 console.log("signed in "+userName+", id="+this.state.userId+" token="+this.state.sessionToken)
				     break;
				 case FORBIDDEN:				     				     
				     this.setMsgFromBackend("Wrong username or password.");
				     break;
				 default:
				     this.setMsgFromBackend("Could not sign in. We don't know why.");
				     break;
				 } // switch

				 
			     }) // fetch
    } 



        //======================================================================

    createSchema = (dbinfo) => {
	console.log("KESKEN: tietokannan luonti puuttuu");

	let req = this.makePostReq(dbinfo);

	console.log("createSchema, req", req);
	console.log("createSchema, osote",'/epdb/owner/list/'+this.state.userId)
	this.fetchAndProcess(Routes.createSchema(this.state.userId), req, "App.js/createSchema",
			     (data, status)=>{
				 switch (status) {				 
				 case OK:
				     this.setMsgFromBackend("Database '"+data.dbName+"' succesfully created.");
				     
				     console.log("createSchema onnistui");
				     // 
				     console.log("KESKEN: kun dbvalinta valmis, just luotu tietokanta pitää samalla valita");
				     this.readAllSchemas();
				     this.readSchema(data.dbId);
				     break;
				 default:
				     this.setMsgFromBackend("Could not create database. We don't know why.");
				     break;
				 } // switch
			     }) // fetch	

    }


    cancelCreateSchema = (dbinfo) => {
	console.log("KESKEN: tietokannan luonnin peruminen puuttuu");
    }

        //======================================================================



    readAllSchemas = () => {

	let req = this.makeGetReq();

	console.log("getlist, req", req);
	console.log("getlist, user=",this.state.userId)
	this.fetchAndProcess(Routes.readAllSchemas(this.state.userId), req, "App.js/getList",
			     (data, status)=>{
				 console.log("got dblist", data.dbList);
				 this.setState({dbList:data.dbList});
			     }) // fetch	


}



    
    readSchema = (dbId) => {
	
	console.log("KESKEN: tietokannan valint puuttuu");

	let req = this.makeGetReq();

	console.log("readSchema, req", req);

	this.fetchAndProcess(Routes.readSchema(this.state.userId,dbId), req, "App.js/readSchema",
			     (data, status)=>{
				 switch (status) {				 
				 case OK:

				     this.setState({
					 dbId: dbId,
					 dbName: data.dbName,
					 dbDescription: data.dbDescription,
					 dbTemplate: data.dbTemplate,
					 rowUnderUpdate: RowContents.emptyRow(data.dbTemplate)
				     });

				     
				     this.setMsgFromBackend("Database '"+data.dbName+"' in use.");
				     
				     console.log("readSchema onnistui");
				     this.readAllRows(data.dbId);
				     break;
				 case FORBIDDEN:
				     this.setMsgFromBackend("No access to database");
				     break;
				 default:
				     this.setMsgFromBackend("Cannot use database. We don't know why.");
				     break;
				 } // switch
			     }) // fetch	

    }


    readAllRows(dbId) {
	
	let req = this.makeGetReq();

	console.log("readSchema, req", req);

	this.fetchAndProcess(Routes.readAllRows(this.state.userId,dbId), req, "App.js/readAllRows",
			     (data, status)=>{
				 switch (status) {				 
				 case OK:

				     this.setState({
					 dbRows: data,					 
				     });

				     
				     this.setMsgFromBackend("Database contents retrieved.");
				     
				     console.log("readAllRows onnistui");
				     break;
				 case FORBIDDEN:
				     this.setMsgFromBackend("No access to database.");
				     break;
				 default:
				     this.setMsgFromBackend("Could note read database. We don't know why.");
				     break;
				 } // switch
			     }) // fetch	

    }

    showDBname = () => {
	if (isEmpty(this.state.dbName)) { return([]) }
	else { return(<span>: <span style={{"fontWeight":"bold"}}> {this.state.dbName} </span></span>) }
    }
    
    render() {

	console.log("userRole", this.state.userRole)
	console.log("muista AddArea:mn disabled toisinpäin");
	
	const functionList = {initiateSignUp:this.initiateSignUp,
			      initiateSignIn:this.initiateSignIn,
			      signOut:this.signOut,
			      finalizeSignUp:this.finalizeSignUp,
			      finalizeSignIn:this.finalizeSignIn,
			      cancelSignUpIn:this.cancelSignUpIn,
			      consumeMsgFromBackend:this.consumeMsgFromBackend,
			      createSchema:this.createSchema,
			      cancelCreateSchema:this.cancelCreateSchema,
			      readSchema:this.readSchema,
			      changeRow:this.changeRow,
			     };

	switch (this.state.pageState) {
	case "signup":
		    	return(
			<div className="App">
			<LoginPage action="signup" appState={this.state} appFuns={functionList}/>
			</div>
		)

	case "signin":
	    	return(
			<div className="App">
			<LoginPage action="signin" appState={this.state} appFuns={functionList}/>
			</div>
		)
	default:
	return(
		<div className="App">
		<NavBar appState={this.state} appFuns={functionList}/>

		<Box m={2}>
		<ExpansionPanel onChange={this.consumeMsgFromBackend}>
		<ExpansionPanelSummary
	    expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
		>
		<Typography color="primary" >Choose a database</Typography>
		</ExpansionPanelSummary>
		<ExpansionPanelDetails>
		<Typography component="div">
		<ChooseDBarea appState={this.state} appFuns={functionList}/>				
	       </Typography>
		</ExpansionPanelDetails>

	    </ExpansionPanel>
		
		<ExpansionPanel disabled={(this.state.userRole!=="editor")}
	    onChange={this.consumeMsgFromBackend}
		>

		<ExpansionPanelSummary
	    expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
		>
		<Typography color="primary">Manage databases</Typography>
		
		</ExpansionPanelSummary>
		<ExpansionPanelDetails>
		<Typography component="div">
		<CreateDBarea appState={this.state} appFuns={functionList}/>
	       </Typography>
		</ExpansionPanelDetails>

	    	    </ExpansionPanel >
		<ExpansionPanel disabled={(!this.state.dbId)} onChange={this.consumeMsgFromBackend}>

	    <ExpansionPanelSummary
	    expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3a-content"
            id="panel3a-header"
		>
		<Typography color="primary" >Settings</Typography>
		</ExpansionPanelSummary>
		<ExpansionPanelDetails>
		<Typography component="div">
		<SettingsArea appState={this.state} appFuns={functionList}/>
	       </Typography>
		</ExpansionPanelDetails>

	    	    </ExpansionPanel >
		<ExpansionPanel disabled={!((!this.state.dbId) || (this.state.userRole!=="editor"))}
	    onChange={()=>{
		this.consumeMsgFromBackend();
		let emptyRow = RowContents.emptyRow(this.state.dbTemplate);
		this.setState({rowUnderUpdate:emptyRow});
	    }}
		>

	    <ExpansionPanelSummary
	    expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4a-content"
            id="panel4a-header"
		>
		<Typography color="primary" >Add new data</Typography>
		</ExpansionPanelSummary>
		<ExpansionPanelDetails>
		<Typography component="div">
		<AddRowArea appState={this.state} appFuns={functionList}/>
		
	       </Typography>
		</ExpansionPanelDetails>
	    </ExpansionPanel>
		<ExpansionPanel disabled={(!this.state.dbId)} onChange={this.consumeMsgFromBackend}>

	    <ExpansionPanelSummary
	    expandIcon={<ExpandMoreIcon />}
            aria-controls="panel5a-content"
            id="panel5a-header"
		>
		
		<Typography color="primary" >Database contents{this.showDBname()}</Typography>
		</ExpansionPanelSummary>
		<ExpansionPanelDetails>
		<Typography component="div">
		<ContentsArea appState={this.state} appFuns={functionList}/>
	       </Typography>
		</ExpansionPanelDetails>

	    </ExpansionPanel>
	
</Box>
	    
		</div>
	)
	} // switch
    }
}
/*

    // ######################################################################
    // SIIVOTTAVAA
    // ######################################################################
    


  
    //======================================================================
    changeDBState = (cmd, info) => {
	switch (cmd) {
	case 'create':
	    {  // suluissa jotta let req:lle block scope
		let req = makePostReq(info)
		{
		    method: "POST",
		    mode: "cors",
		    headers: {"Content-type":"application/json"},
		    body: JSON.stringify(info)
		}
		this.fetchAndProcess('/epdb/content/'+this.state.userId+"/"+this.state.dbId, req, "App.js/changeDBState/create", ()=>{});

		this.getDBcontent();		
	    }
	    break;
	case 'delete':
	    {
		console.log("App.js/del",info)
		let req = {
		    method: "DELETE",
		    mode: "cors",
		    headers: {"Content-type":"application/json"},
		}
		this.fetchAndProcess('/epdb/content/'+this.state.userId+"/"+this.state.dbId+"/"+info, req, "App.js/changeDBState/delete", ()=>{});
		
		this.getDBcontent();
		

	    }
	    break;
	case 'update':

	    console.log("appjs",info)
	    
	    {  // suluissa jotta let req:lle block scope
		let req = makePutReq(info)
		
		this.fetchAndProcess('/epdb/content/'+this.state.userId+"/"+this.state.dbId+"/"+info._id, req, "App.js/changeDBState/update", ()=>{});

    		this.getDBcontent();		
	    }
	    
	    
	    break;
	default:
	    console.log("VIRHE. Tuntematon kannanpäivityskäsky.");
	}
    }

    //======================================================================
    setUserIdentity = (userName, userId) => {
//	let newState = this.state;
//	newState.userName = userName;
//	newState.userName = userName;
	this.setState({userName: userName, userId: userId});
	console.log("user "+this.state.userName+" = "+this.state.userId);
	console.log("PUUTTUU: sessionstorageen tallennus ettei reload tuhoa tilaa");
    }

    //======================================================================
    readSchema = (dbId) => {

	// oletustietokanta on valittava täällä koska:
	// tätä kutsutaaan myös login-tilassa jossa on
	// pakko tehä joku valinta (myöhemmin tänne päätyy
	// vain jos jotain oikeasti muuttuu)

	if (dbId === "") {
	    dbId = this.state.dbNames[0].id;
	}
	
	
	//console.log("App ", dbId)
	
	let newState = this.state;
	newState.dbId = dbId;
	this.setState(newState, () => {
	    // tapahtuu vasta kun tila muuttunut
	    this.getDBinfo();
            this.getDBcontent();
	});
	//console.log("dbid ",this.state.dbId);
	
    }

*/

export default App;
