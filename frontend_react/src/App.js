import React from 'react';
import './App.css';
//import OpenCloseArea from './comps/OpenCloseArea';


import Typography from '@material-ui/core/Typography'
//import List from '@material-ui/core/List'
//import ListItem from '@material-ui/core/ListItem'
//import ListItemText from '@material-ui/core/ListItemText'
//import Button from '@material-ui/core/Button'
//import InputLabel from '@material-ui/core/InputLabel'
//import Input from '@material-ui/core/Input'
//import OutlinedInput from '@material-ui/core/OutlinedInput'
import Box from '@material-ui/core/Box'
//import {withStyles} from '@material-ui/core'
//import {makeStyles} from '@material-uib/core'



import {ExpansionPanel,ExpansionPanelSummary,ExpansionPanelDetails} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
//import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
//import Grid from '@material-ui/core/Grid';
//import Paper from '@material-ui/core/Paper';
//import Card from '@material-ui/core/Card';
//import FormLabel from '@material-ui/core/FormLabel';
//import TextField from '@material-ui/core/TextField';


//import {Select, MenuItem, FormControl} from '@material-ui/core';


import SettingsArea from './SettingsArea';
import ChooseDBarea from './ChooseDBarea';
import CreateDBarea from './CreateDBarea';
import ContentsArea from './ContentsArea';
import Row from './Row';
import LoginPage from './LoginPage';
import NavBar from './NavBar';
import {isEmpty} from './helperfuns';
//import {isEmpty,DDTinputLabel} from './helperfuns';

/*
const DEBUG = true;
const debugstyle = {color: "gray", fontSize: "0.8em", fontStyle:"italic"}
*/

const OK = "ok";
const FORBIDDEN = "forbidden";
const CONFLICT = "conflict";
const NOT_FOUND = "not found";
const SOME_ERROR = "error";



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
	    settings: {groupBy: "none", showShared: true, valueVisibility: {"at-this-moment": "unknown"} },
	    rowUnderUpdate: {},
	    rowUpdateMode: "view",
	})};


    
    toEditMode = () => { console.log("toEditMode"); this.setState({rowUpdateMode:"edit"}) }
    toRemoveMode = () => { console.log("toRemoveMode"); this.setState({rowUpdateMode:"remove"}) }
    toViewMode = () => { console.log("toViewMode"); this.setState({rowUpdateMode:"view"}) }
    toAddMode = () => { console.log("toAddMode"); this.setState({rowUpdateMode:"add"}) }


    
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


    toggleRowPublicity = (event) => {
	let newrow = this.state.rowUnderUpdate;	
	newrow["_isPublic"] = event.target.checked;
	this.setState({rowUnderUpdate: newrow});
    }

    
    // ==================================================


        toggleSharing = (event) => {
	let state = this.state;
	console.log("toggle ",event.target.checked) 
	state.settings.showShared = event.target.checked;
	this.setState(state);
    }


    toggleVisibility = (event) => {
	let state = this.state;

	state.settings.valueVisibility[event.target.name] = event.target.checked;				   
	console.log("toggle vis ",event.target)
	this.setState(state);
    }


    chooseGroupingField = (event) => {
	
	console.log("chpóki ",event.target.value)

	let state = this.state;
	state.settings.groupBy = event.target.value;
	state.settings.valueVisibility = {};
	if (state.settings.groupBy !== "none") {
	    let typeName = this.state.dbTemplate.dbFieldTypes[state.settings.groupBy];
	    for (let iind=0; iind<this.state.dbTemplate.dbEnums[typeName].length; iind++) {
		let valueName = this.state.dbTemplate.dbEnums[typeName][iind];
	    state.settings.valueVisibility[valueName] = true;
	}}

	console.log(state)
	this.setState(state);
	
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

    finalizeCreateRow = () => {

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

    initiateCreateRow = () => {
	this.cancelUpdateRow();
	this.cancelDeleteRow();
	this.setState({rowUnderUpdate: Row.emptyRow(this.state.dbTemplate)});
	this.toAddMode();
	console.log("initiateCreateRow",this.state.rowUpdateMode);
    }

  
    cancelCreateRow = () => {
	console.log("cancelCreateRow, kenttien pitäisi tyhjetä");
	this.setState({rowUnderUpdate: Row.emptyRow(this.state.dbTemplate)});
    }


    initiateUpdateRow = (index) => {
	this.cancelCreateRow();
	this.cancelDeleteRow();
	console.log("initiateUpdateRow",index)
	this.setState({rowUnderUpdate: this.state.dbRows[index]})
	console.log("initiateUpdateRow", this.state.rowUnderUpdate)
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
		    this.setMsgFromBackend("Could not update database. We don't know why.");
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
	this.cancelUpdateRow();
	this.cancelDeleteRow();
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

	console.log("BUGI: näyttää isot oravat kun otsikko sanoo että pienet")
	console.log("PIKKUBUGEJA: 1: selectin leveys ei muutu vaikka pitkä dbnimi");

	/*
	console.log("userRole", this.state.userRole)
	console.log("row mode", this.state.rowUpdateMode)
*/
	
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
			      initiateCreateRow:this.initiateCreateRow,
			      finalizeCreateRow:this.finalizeCreateRow,
			      cancelCreateRow:this.cancelCreateRow,
			      initiateUpdateRow:this.initiateUpdateRow,
			      finalizeUpdateRow:this.finalizeUpdateRow,
			      cancelUpdateRow:this.cancelUpdateRow,
			      initiateDeleteRow:this.initiateDeleteRow,			      
			      finalizeDeleteRow:this.finalizeDeleteRow,
			      cancelDeleteRow:this.cancelDeleteRow,			      
			      toggleSharing:this.toggleSharing,
			      toggleVisibility:this.toggleVisibility,
			      chooseGroupingField:this.chooseGroupingField,
			      toggleRowPublicity:this.toggleRowPublicity,
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
            aria-controls="panel0a-content"
            id="panel0a-header"
		>
		<Typography color="primary" >About</Typography>
		</ExpansionPanelSummary>
		<ExpansionPanelDetails>
		<Typography component="div">
		<p>
		This is a project work for Full-Stack-Dev recruiting course.
		<br/>
		<br/>
		(c) Eli Parviainen 2019
		</p>
	       </Typography>
		</ExpansionPanelDetails>

	    </ExpansionPanel>
		
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


/*

	    	    </ExpansionPanel >
		<ExpansionPanel disabled={((this.state.dbId===NODB) || (this.state.userRole!=="editor"))}
	    onChange={(event, expanded)=>{
		this.consumeMsgFromBackend();
		if (expanded)
		{this.initiateCreateRow(); this.toAddMode()}
		else
		{this.cancelCreateRow(); this.toViewMode()}
		//let emptyRow = Row.emptyRow(this.state.dbTemplate);
		//this.setState({rowUnderUpdate:emptyRow});
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
		



class AddRowArea extends React.Component {

    

    render() {

	
// kohta ei ole auki jos ei ole valittu mutta jostain syystä tulee tänne kuitenkin? 
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


*/
