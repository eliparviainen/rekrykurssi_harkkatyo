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
//import InputLabel from '@material-ui/core/InputLabel'
//import Input from '@material-ui/core/Input'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Box from '@material-ui/core/Box'
//import {withStyles} from '@material-ui/core'
//import {makeStyles} from '@material-ui/core'

import {ExpansionPanel,ExpansionPanelSummary,ExpansionPanelDetails} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
//import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
//import FormLabel from '@material-ui/core/FormLabel';
import TextField from '@material-ui/core/TextField';


import {Select, MenuItem, FormControl} from '@material-ui/core';


import CreateDBarea from './CreateDBarea';
import LoginPage from './LoginPage';
import {isEmpty, DDTinputLabel} from './helperfuns';

const DEBUG = true;
const debugstyle = {color: "gray", fontSize: "0.8em", fontStyle:"italic"}


const OK = "ok";
const FORBIDDEN = "forbidden";
const CONFLICT = "conflict";
const NOT_FOUND = "not found";
const SOME_ERROR = "error";



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

    
    render() {

	console.log("PIKKUBUGEJA: 1: selectin leveys ei muutu vaikka pitkä dbnimi, 2: valikko peittää selitystekstejä");
	
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
	    <Grid container>
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


	    </>
    )
	// 
    } 
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
	console.log("AddRowArea, dbId",this.props.appState.dbId)
	console.log("AddRowArea, userRole",this.props.appState.userRole)
	
/* kohta ei ole auki jos ei ole valittu mutta jostain syystä tulee tänne kuitenkin? */ 
	if (this.props.appState.dbId===NODB||(this.props.appState.userRole!=="editor")) {
	    return(<div> No database selected. </div>)
	}
	

//	console.log("add row template",	this.props.appState.dbTemplate)

		
		    return(
			    <>
			    <Row renderMode="add" 
			appState={this.props.appState}
			appFuns={this.props.appFuns}
			viewRowIndex="tämän asettaa ADD vaikkei tarttisi"
			    />
			   
			    <Box mt={2}>
	    <Typography component="span" color="secondary">{this.props.appState.msgFromBackend}</Typography>
	    </Box>
		

	    </>
	)

    }    
}



//import StateHelper from './StateHelper';

// ============================================================
 class RowControls extends React.Component
// ============================================================
{
    renderViewControls = () => {

	/*
	console.log("renderViewC,indes",this.props.viewRowIndex)
	console.log("renderViewC,dbRows",this.props.appState.dbRows);
	console.log("renderViewC, user",this.props.appState.userId);
	console.log("renderViewC,row",this.props.appState.dbRows[this.props.viewRowIndex])
	console.log("renderViewC,row.owner",this.props.appState.dbRows[this.props.viewRowIndex]._owner)
*/
	
	
	if (this.props.appState.dbRows[this.props.viewRowIndex]._owner === this.props.appState.userId) {
	    
	    return(
		    <>
		    <Button onClick={()=>{this.props.appFuns.initiateUpdateRow(this.props.viewRowIndex);}} variant="outlined" color="primary" size="small">Edit</Button>  
		    <Button onClick={()=>{this.props.appFuns.initiateDeleteRow(this.props.viewRowIndex);}} variant="outlined" color="primary" size="small">Remove</Button>
		    </>	    )
	
	} else {
	    return(
		    <div className="sharingInfo"> Shared by another user<br/> (no editing) </div>
	    )
	}

	  
    }


    renderEditControls = () => {


	return(
	    <>
		<Button onClick={()=>{this.props.appFuns.finalizeUpdateRow();}} variant="outlined" color="secondary" size="small">Save</Button>  
		<Button onClick={()=>{this.props.appFuns.cancelUpdateRow();}} variant="outlined" color="secondary" size="small">Discard edits</Button>
		    </>	
)
    }


    renderRemoveControls = () => {


	return(
	    <>

		<Button variant="outlined" color="secondary" onClick={()=>{this.props.appFuns.finalizeDeleteRow();}}>
		Confirm remove</Button>
		<Button variant="outlined" color="secondary" onClick={()=>{this.props.appFuns.cancelDeleteRow();}}>
		Cancel remove</Button>
		</>	       
)
    }

    
        renderAddControls = () => {
	    

	    return(
		    <>
		    <Button onClick={this.props.appFuns.createRow} variant="outlined" color="primary" size="small">Add</Button>  
		    <Button onClick={this.props.appFuns.cancelCreateRow} variant="outlined" color="primary" size="small">Clear fields</Button>
		    </>


)
    }


    render() {
	switch (this.props.controlMode) {
	case "edit":
	    return(this.renderEditControls())
	case "add":
	    return(this.renderAddControls())
	case "remove":
	    return(this.renderRemoveControls())
	default:
	    return(this.renderViewControls())
	    	} // switch
    }
}




export class Row extends React.Component {


    static emptyRow(template) {
	// this.props.appState.dbTemplate
	let newRow = {};
	let enumTypes = [];
	for (let key in template.dbEnums) { enumTypes.push(key); }
	for (let key in template.dbFieldTypes)
	{
	    switch (template.dbFieldTypes[key]) {
	    case "string": newRow[key]=""; break;
	    case "text": newRow[key]=""; break;
	    case "url": newRow[key]=""; break;
	    case "number":newRow[key]=0; break;
	    default:
		// implicit assumption: everything not listed above is enum
		let ind = enumTypes.indexOf(template.dbFieldTypes[key]);
		if (ind>=0) {
		    let typeName = enumTypes[ind];
		    newRow[key]=template.dbEnums[typeName][0]; break;
		} else {
		    newRow[key]="(no value)";
		}
	    }//switch
	}//for

	return(newRow);
    }


    /*
    setIndex = (event) => {
	this.setState({indexInMenu:event.target.dataset.index});	
    }
*/


    renderSimpleInput = (elemwid, key, index, typeTag, multiline) => {

	elemwid = 12;
	
	if (this.props.renderMode === "edit" || this.props.renderMode === "add") {
	    if (!multiline) { multiline=false; }
	    let renderAsType = typeTag;
	    if (typeTag==="url") { renderAsType="string" }

	    
	    //console.log("renderSimpleInput",key)
	    //console.log("renderSimpleInput",this.props.appState.rowUnderUpdate[key])

	    // Initially, rowUnderUpdate comes here as an empty object so input
	    // values are undefined. Changing from unefined to defined later is
	    // not tolerated. So don't render undefineds.
	    if (this.props.appState.rowUnderUpdate[key]===undefined) {
		//console.log("ongelmakenttiä ei renderöidä");
		/*
		return(<TableRow key={index}>
		       <TableCell>
		       </TableCell></TableRow>)
		*/
		return(
			<Grid item xs={elemwid} key={index}>
		       </Grid>)

	    }

	    
	    	return(
			
			    <Grid container item xs={elemwid} key={index}>
			<DDTinputLabel>{key} </DDTinputLabel>
			<OutlinedInput type={renderAsType} fullWidth={true} label={key}
		    placeholder={"("+typeTag+")"}
	    name={key}
	    multiline={multiline}
			value={this.props.appState.rowUnderUpdate[key]}
			onChange={this.props.appFuns.changeRowUnderUpdate} />
			</Grid>
			
	)
	} // edit/add
	else {

	    //KESKEN
	    //rivin tallentaja ei laita datakenttiä lainkaan, vain systeemikentät
	    
/*
	    console.log("simple-render-for-view, index",this.props.viewRowIndex);
	    console.log("simple-render-for-view, rivi",this.props.appState.dbRows[this.props.viewRowIndex]);
	    console.log("simple-render-for-view, kenttä",this.props.appState.dbRows[this.props.viewRowIndex][key]);
*/
	    

//	    let st = (typeTag==="url")?{"fontStyle":"italic"}:{};
	    //	    return( <TableRow key={index}><TableCell style={st} multiline={multiline}>&nbsp;{this.props.appState.dbRows[this.props.viewRowIndex][key]}</TableCell></TableRow>)
	    

	    let fieldElem = [];
	    switch (typeTag) {
	    case "url":
		fieldElem = <TextField name="dbfield" variant="outlined"  margin="normal" style={{"fontStyle":"italic"}} InputProps={{readOnly: true}} label={key} defaultValue={this.props.appState.dbRows[this.props.viewRowIndex][key]}/>
		    break;
	    case "text":
		fieldElem = <TextField name="dbfield" variant="outlined"  margin="normal" InputProps={{readOnly: true}} label={key} defaultValue={this.props.appState.dbRows[this.props.viewRowIndex][key]} multiline/>
		    break;
	    case "string":
	    case "number":
	    default:
		fieldElem =
		    fieldElem = <TextField name="dbfield" variant="outlined" margin="normal" InputProps={{readOnly: true}} label={key} defaultValue={this.props.appState.dbRows[this.props.viewRowIndex][key]} />
		    break;
	    } // switch
	    return(
		   <Grid item xs={elemwid} key={index}>
		    <Card style={{padding:"0.25em"}}>
		    { fieldElem }
		   </Card>

		   </Grid>
	    )
	} // view
    }

    
    /*
    changeEnum = (fieldName, value) => {
	let newVals = this.state.enumVals;
	newVals[fieldName]=value;
	this.setState({enumVals:newVals});
    }
    */
			
    renderEnumInput = (elemwid, key, index, enumName) => {

	elemwid = 12;
	
	// lyhenne
	let templateEnums = this.props.appState.dbTemplate.dbEnums;

	/*
	console.log('renderEnumInput enter, enumname=', enumName);
	console.log('renderEnumInput enter, enums=', templateEnums);
*/
	
	if (this.props.renderMode === "edit" || this.props.renderMode === "add") {

//	    zzz
	    /*
	    console.log('renderEnumInput name', enumName);
	    console.log('renderEnumInput all-enums', templateEnums);
	    console.log('renderEnumInput enum[name]', templateEnums[enumName]);
*/
	    
	let optionTags = templateEnums[enumName].map(
	    (enumval, index) => {
		return(<MenuItem key={index} value={enumval} name={enumval}
		       data-index={index} >
		       {enumval}</MenuItem>);
	    }) // map

	    // onMouseEnter={this.setIndex}
	    
	    
	    //console.log( optionTags );
	    // onchange={(event)=>this.changeEnum(enumName, event.target.value)}>

	    //console.log("renderEnum, value", this.props.appState.rowUnderUpdate[key]);

	    if ((!this.props.appState.rowUnderUpdate[key])||isEmpty(optionTags)) {
		//		console.log("ongelmaselektiä ei renderöidä");
		/*
		return(<TableRow key={index}>
		       <TableCell>
		       </TableCell></TableRow>)
		*/
				return(
		       <Grid item xs={elemwid} key={index}>
		       </Grid>)
	    }

	    //	    console.log("ongelmaselect renderöidään");
	    /*
	return(
	    	<TableRow key={index}>
			    
		<TableCell>
		<DDTinputLabel>{key}</DDTinputLabel>

		<FormControl variant="outlined" style={{minWidth:"10em"}}>
		<Select
	    	    name={key}
	    value={this.props.appState.rowUnderUpdate[key]}
	    onChange={this.props.appFuns.changeRowUnderUpdate}>
		{optionTags}
	    </Select>
		</FormControl>
			    </TableCell>
		</TableRow>
	)
	    */
	    return(
		    
		<Grid item xs={elemwid} key={index}>
		<DDTinputLabel>{key}</DDTinputLabel>

		<FormControl variant="outlined" style={{minWidth:"10em"}}>
		<Select
	    	    name={key}
	    value={this.props.appState.rowUnderUpdate[key]}
	    onChange={this.props.appFuns.changeRowUnderUpdate}>
		{optionTags}
	    </Select>
		</FormControl>
		    </Grid>

	)
	} // add/edit
	else {

	    /*
	return(
	    		<TableRow key={index}>			    
		<TableCell>{this.props.appState.rowUnderUpdate[key]}			 
			    </TableCell>
		</TableRow>
	) 
*/
	    // view

	    
	    let fieldElem = <TextField name="dbfield" variant="outlined" margin="normal" InputProps={{readOnly: true}} label={key} defaultValue={this.props.appState.rowUnderUpdate[key]} />

	    	return(
		       <Grid item xs={elemwid} key={index}>
			<Card style={{padding:"0.25em"}}>
			{fieldElem}
		       </Card>
			    </Grid>
	) 
    }
    }

    formattedFields() {


//	console.log("RowCont props.jsonrow",this.props.appState.rowUnderUpdate);
	
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

	let WIDE = 6;
	let NARROW = 4;
	
	fieldnames.forEach( (key, index) => {

	    /*
		console.log("RowCont key-"+index,key)
		console.log("RowCont type-"+index,this.props.appState.dbTemplate.dbFieldTypes[key])
*/

		
		//this.wrapWithTitle(key, () => {
		switch (this.props.appState.dbTemplate.dbFieldTypes[key]) {
		case "string":
		    wideElems.push(this.renderSimpleInput(WIDE, key, index, "text"));
		    break;

		case "url":
		    wideElems.push(this.renderSimpleInput(WIDE, key, index, "url"));
		    break;

		case "text":
		    let multiline=true;
		    wideElems.push(this.renderSimpleInput(WIDE, key, index, "text", multiline));
		    break;
		    			
		case "number":
		    //console.log("kutsuu renderSimple (nro)")


		    narrowElems.push(this.renderSimpleInput(NARROW, key, index, "number"));
		    //console.log("narrow=",narrowElems)
		    break;
		    
		default:

/*
		    console.log("RowCedit, enumTypes",enumTypes)
		    console.log("RowCedit, enumTypes, sisältäkö: ",this.props.appState.dbTemplate.dbFieldTypes[key])
*/
		    
		    if (enumTypes.includes(this.props.appState.dbTemplate.dbFieldTypes[key])) {

			/*
			console.log("RowContents, kenttätyypit",this.props.appState.dbTemplate.dbFieldTypes)
			console.log("RowContents, key=",key)
			console.log("RowContents, löytyi enumtyyppi",this.props.appState.dbTemplate.dbFieldTypes[key])
*/

			
			let enumName = this.props.appState.dbTemplate.dbFieldTypes[key];


			//console.log("kutsuu renderEnum",this.props.appState.rowUnderUpdate[key])
			
			
			narrowElems.push(this.renderEnumInput(NARROW, key, index, enumName));

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

	return({ wide: wideElems, narrow: narrowElems })

    }

    
    render() {
	
	/*
	if (isEmpty(this.props.appState.dbTemplate)) {
	    return(<p>No database.</p>);
	}
*/


	console.log("Row:",this.props.renderMode)

	// add, edit, remove, view
	let ctrlsMode = this.props.renderMode;
	//if (this.props.renderMode==="remove") { ctrlsMode="edit"; }


	let fields = this.formattedFields();
	
		    return(<>
		   <Paper elevation={5} >
			   <Grid container spacing={3}>  
		   
       	    	   <Grid item xs={6}>
			   <Card elevation={0} style={{padding:"0.25em"}}>
			   <Grid container spacing={3}>  
			   {fields.wide}
			   </Grid>
			   </Card>
		   </Grid>

			   <Grid item xs={4}>
			   <Card elevation={0} style={{padding:"0.25em"}}>
			   <Grid container spacing={3}>  
			   {fields.narrow}
			   		   </Grid>
			   </Card>
		   </Grid>

			   
			   <Grid item xs={2}>

			   <RowControls controlMode={ctrlsMode}
		   appState={this.props.appState}
		   appFuns={this.props.appFuns}
			   viewRowIndex={this.props.viewRowIndex}
		   />


		   		   </Grid>
		   </Grid>



		       </Paper>

		   <br/></>
	)


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
	/*
	console.log("ContentArea, enter, rivejä=",this.props.appState.dbRows.length)
		console.log("ContentArea, enter, rivit=",this.props.appState.dbRows)
*/


	
	let BEmsgField = <Box mt={2}>
	    <Typography component="span" color="secondary">{this.props.appState.msgFromBackend}</Typography>
	    </Box>


	
	/* aina aikajärjestys */
	this.props.appState.dbRows.sort(this.timestampSortDesc);

	let rows = [];
	if (this.props.appState.settings.groupBy === "none") {

//	    console.log("no group")
	    
	    rows = this.props.appState.dbRows.map(
	    (dbrow,index) => {

		//console.log("ContentArea, no grouping:",index)
		
		
		if (this.props.appState.settings.showShared || dbrow._owner === this.props.appState.userId) {

		    
		    				    let renderMode="view";
				    if (this.props.appState.rowUpdateMode!=="view") {
					if (dbrow._id===this.props.appState.rowUnderUpdate._id) { renderMode=this.props.appState.rowUpdateMode; }
				    }

		    return(	<Grid key={index} item xs={12}>	    
				<Row key={dbrow._id} renderMode={renderMode}
				appState = {this.props.appState}
				appFuns = {this.props.appFuns}
				viewRowIndex = {index}				
				/>
				</Grid>
		)} else { return([]) }
	    }) // map
	} // if no grouping
	else {


	    rows = [];
	    for (let groupingVariableValue in this.props.appState.settings.valueVisibility) {
		if (this.props.appState.settings.valueVisibility[groupingVariableValue]) {

		    /* käy aina läpi koko tietokannan :( */
		    let rows2 = this.props.appState.dbRows.map(
			(dbrow,index) => {

	    		    //console.log("ContentArea, grouping:",index)
			    
			    if (dbrow[this.props.appState.settings.groupBy]===groupingVariableValue) {

				if (this.props.appState.settings.showShared || dbrow._owner === this.props.appState.userId) {
				    let renderMode="view";
				    if (this.props.appState.rowUpdateMode!=="view") {
					if (dbrow._id===this.props.appState.rowUnderUpdate._id) { renderMode=this.props.appState.rowUpdateMode; }
				    }
				return(
					<Row key={dbrow._id}
				    renderMode={renderMode}
				    viewRowIndex = {index}
				    appState = {this.props.appState}
				    appFuns = {this.props.appFuns}
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
			    <Grid container spacing={3}>
			    {rows2}
			</Grid>
			    </div>
		    );
		    
	    } // if
	    } // for
	}

//	('contents',rows)

	console.log("PUUTTUU: rivin merkkaaminen jaetuksi/yksityiseksi")
	return(
		<>
		<Grid container spacing={3}>
		<Grid item xs={12}>
		{BEmsgField}
		</Grid>
		</Grid>
		<Grid container spacing={3}>
		{rows}
		</Grid>
	    </>
	)
    }

}



/*
const DDTformLabel= withStyles({
  root: {
      color: "text.secondary",
      fontSize: "0.8em",
      padding: "0.25em",
  },
})(FormLabel);
*/


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


const NODB = 0;
const NOBODY = 0;

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
	    rowUpdateMode: "",
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
	    userId: NOBODY,
	    userName: "",
	    sessionToken: "",
	    userRole: "visitor",
	    dbList: [],
	    dbId: NODB,
	    dbName: "",
	    dbDescription: "",
	    dbRows: [],
	    dbTemplate: {},
	    msgFromBackend: "",
	    settings: {groupBy: "none", showShared: true },
	    rowUnderUpdate: {},
	    rowUpdateMode: "view",
	})};


    
    toEditMode = () => { console.log("toEditMode"); this.setState({rowUpdateMode:"edit"}) }
    toRemoveMode = () => { console.log("toRemoveMode"); this.setState({rowUpdateMode:"remove"}) }
    toViewMode = () => { console.log("toViewMode"); this.setState({rowUpdateMode:"view"}) }
//    toAddMode = () => { this.setState({mode:"add"}) }


    
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


    
    changeRowUnderUpdate = (event) => {
	//console.log(" changeRowUnderUpdate",event);
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

		console.log("fetchAndProcess resp",response)
		
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
	//console.log("makePostReq ",info)
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

	//console.log("sigout, req", req);
	this.fetchAndProcess(Routes.signout(this.state.userId), req, "App.js/signOut",
			     (data, status)=>{
				 console.log("signed out with status", status);
				 // In principle, a user could continue using a public database after signout,
				 // but keeping track of this is complicated. Always start from an initial state.
				 this.zeroState();
				 this.readAllSchemas();
				 this.userIntoVisitor();	
				 this.appToBrowseState();
				 
			     }) // fetch
    }


    finalizeSignUp = (userName, password) => {	
        let req = this.makePostReq({"userName": userName, "password":password});

	//console.log("finalizeSignUp, req", req);
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

	//console.log("finalizeSignIn, req", req);
	this.fetchAndProcess(Routes.signin(), req, "App.js/finalizeSignIn",
			     (data, status)=>{
				 console.log("finalizeSignIn, status",status)
				 switch (status) {				 
				 case OK:
				     console.log("finalizeSignIn, ok",status)
				     this.setState({userId:data.userId, sessionToken:data.sessionToken})
				     this.userIntoEditor();
				     this.appToBrowseState();
				     // may see more databases after logging in
				     this.readAllSchemas();
				     if (this.state.dbId!==NODB) {
					 // may see more rows after logging in
					 this.readAllRows(this.state.dbId);
				     }
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

	let req = this.makePostReq(dbinfo);

	this.fetchAndProcess(Routes.createSchema(this.state.userId), req, "App.js/createSchema",
			     (data, status)=>{
				 switch (status) {				 
				 case OK:
				     this.setMsgFromBackend("Database '"+data.dbName+"' succesfully created.");
				     
				     //console.log("createSchema onnistui");
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

	this.fetchAndProcess(Routes.readAllSchemas(this.state.userId), req, "App.js/getList",
			     (data, status)=>{
				 //console.log("got dblist", data.dbList);
				 this.setState({dbList:data.dbList});
			     }) // fetch	


}



    
    readSchema = (dbId) => {
	

	let req = this.makeGetReq();


	this.fetchAndProcess(Routes.readSchema(this.state.userId,dbId), req, "App.js/readSchema",
			     (data, status)=>{
				 switch (status) {				 
				 case OK:

				     this.setState({
					 dbId: dbId,
					 dbName: data.dbName,
					 dbDescription: data.dbDescription,
					 dbTemplate: data.dbTemplate,
					 rowUnderUpdate: Row.emptyRow(data.dbTemplate)
				     });

				     
				     this.setMsgFromBackend("Database '"+data.dbName+"' in use.");
				     
				     //console.log("readSchema onnistui");
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

	
	this.fetchAndProcess(Routes.readAllRows(this.state.userId,dbId), req, "App.js/readAllRows",
			     (data, status)=>{
				 switch (status) {				 
				 case OK:

				     this.setState({
					 dbRows: data,
					 dbId: dbId
				     });
				     this.toViewMode();
				     
				     this.setMsgFromBackend("Retrieved newest database contents.");
				     
				     console.log("readAllRows onnistui, riveja=", this.state.dbRows.length);
				     break;
				 case FORBIDDEN:
				     this.setMsgFromBackend("No access to database.");
				     break;
				 default:
				     this.setMsgFromBackend("Could not read database. We don't know why.");
				     break;
				 } // switch
			     }) // fetch	

    }


    // ==================================================

    createRow = () => {

	let req = this.makePostReq(this.state.rowUnderUpdate);

	console.log("createRow: ", this.state.rowUnderUpdate)

	this.fetchAndProcess(
	    Routes.createRow(this.state.userId, this.state.dbId), req, "App.js/createRow",
	    (data, status)=>{

		console.log("createRow, data", data)
		console.log("createRow, status", status)
		
		switch (status) {				 
		case OK:

		    this.setMsgFromBackend("Database row added.");
		    this.readAllRows(this.state.dbId);
				     
		    //console.log("createRow onnistui");
		    break;
		case FORBIDDEN:
		    this.setMsgFromBackend("No access to database.");
		    break;
		default:
		    this.setMsgFromBackend("Could not update database. We don't know why.");
		    break;
		} // switch
	    }) // fetch	
	
	this.setState({rowUnderUpdate: Row.emptyRow(this.state.dbTemplate)});
    }

  
    cancelCreateRow = () => {
	console.log("cancelCreateRow, kenttien pitäisi tyhjetä");
	this.setState({rowUnderUpdate: Row.emptyRow(this.state.dbTemplate)});
    }


    initiateUpdateRow = (index) => {
	console.log("initiateUpdateRow")
	this.setState({rowUnderUpdate: this.state.dbRows[index]})
	this.toEditMode();
    }

    
    finalizeUpdateRow = () => {


	let req = this.makePutReq(this.state.rowUnderUpdate);


	let rowId = this.state.rowUnderUpdate._id;
	this.fetchAndProcess(
	    Routes.updateRow(this.state.userId, this.state.dbId, rowId), req, "App.js/updateRow",
	    (data, status)=>{
		switch (status) {				 
		case OK:

		    this.setMsgFromBackend("Database row updated.");
		    this.readAllRows(this.state.dbId); 
				     
		    //console.log("updateRow onnistui");
		    break;
		case FORBIDDEN:
		    this.setMsgFromBackend("No access to this row.");
		    break;
		default:
		    this.setMsgFromBackend("Could note update database. We don't know why.");
		    break;
		} // switch
	    }) // fetch	
	
	this.setState({rowUnderUpdate: Row.emptyRow(this.state.dbTemplate)});
	this.toViewMode();
    }

    cancelUpdateRow = () => {
	this.setState({rowUnderUpdate: Row.emptyRow(this.state.dbTemplate)});
	this.toViewMode();
    }


    initiateDeleteRow = (index) => {
	console.log("initiateDeleteRow")
	this.setState({rowUnderUpdate: this.state.dbRows[index]})
	this.toRemoveMode();
    }
    

	finalizeDeleteRow = () => {
	
	let req = this.makeDeleteReq(this.state.rowUnderUpdate);


	let rowId = this.state.rowUnderUpdate._id;
	this.fetchAndProcess(
	    Routes.deleteRow(this.state.userId, this.state.dbId, rowId), req, "App.js/deleteRow",
	    (data, status)=>{
		switch (status) {				 
		case OK:

		    this.setMsgFromBackend("Database row updated.");
		    this.readAllRows(this.state.dbId); 
				     
		    //console.log("deleteRow onnistui");
		    break;
		case FORBIDDEN:
		    this.setMsgFromBackend("No access to this row.");
		    break;
		default:
		    this.setMsgFromBackend("Could note update database. We don't know why.");
		    break;
		} // switch
	    }) // fetch	
	
	    this.setState({rowUnderUpdate: Row.emptyRow(this.state.dbTemplate)});
	    this.toViewMode();
    }

    cancelDeleteRow = () => {
	this.setState({rowUnderUpdate: Row.emptyRow(this.state.dbTemplate)});
	this.toViewMode();
    }

    // ==================================================
    
    
    showDBname = () => {
	if (isEmpty(this.state.dbName)) { return([]) }
	else { return(<span>: <span style={{"fontWeight":"bold"}}> {this.state.dbName} </span></span>) }
    }
    
    render() {

	console.log("TextField: jos kentän arvo on tyhjä menee label-tieto ite kenttään (ominaisuus muttei hyvä)")
	
	console.log("userRole", this.state.userRole)
	console.log("row mode", this.state.rowUpdateMode)
//	console.log("muista AddArea:mn disabled toisinpäin");
	
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
			      changeRowUnderUpdate:this.changeRowUnderUpdate,
			      createRow:this.createRow,
			      cancelCreateRow:this.cancelCreateRow,
			      initiateUpdateRow:this.initiateUpdateRow,
			      finalizeUpdateRow:this.finalizeUpdateRow,
			      cancelUpdateRow:this.cancelUpdateRow,
			      initiateDeleteRow:this.initiateDeleteRow,			      
			      finalizeDeleteRow:this.finalizeDeleteRow,
			      cancelDeleteRow:this.cancelDeleteRow,			      
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
		<ExpansionPanel disabled={(this.state.dbId===NODB)} onChange={this.consumeMsgFromBackend}>

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
		<ExpansionPanel disabled={((this.state.dbId===NODB) || (this.state.userRole!=="editor"))}
	    onChange={()=>{
		this.consumeMsgFromBackend();
		let emptyRow = Row.emptyRow(this.state.dbTemplate);
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
		<ExpansionPanel disabled={(this.state.dbId===NODB)} onChange={this.consumeMsgFromBackend}>

	    <ExpansionPanelSummary
	    expandIcon={<ExpandMoreIcon />}
            aria-controls="panel5a-content"
            id="panel5a-header"
		>
		
		<Typography color="primary" >Database contents{this.showDBname()}</Typography>
		</ExpansionPanelSummary>
		<ExpansionPanelDetails>
		
		<ContentsArea appState={this.state} appFuns={functionList}/>

		</ExpansionPanelDetails>

	    </ExpansionPanel>
	
</Box>
	    
		</div>
	)
	} // switch
    }
}

export default App;
