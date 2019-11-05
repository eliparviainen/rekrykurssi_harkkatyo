import React from 'react';
import './App.css';
import OpenCloseArea from './comps/OpenCloseArea';

//import MainLayout from './comps/MainLayout';
//import Login from './comps/Login';
//import StateHelper from './comps/StateHelper';

const DEBUG = true;
const debugstyle = {color: "gray", fontSize: "0.8em", fontStyle:"italic"}




class ChooseDBarea extends OpenCloseArea {
    render() {
	return(
	    <div> ChooseDBarea </div>
	)
    }
}


class CreateDBarea extends OpenCloseArea {
    render() {
	if (this.props.appState.userRole!=="editor") {

	if (DEBUG) {
	    return(<div style={debugstyle}> debug: CreateDBarea ei näy koska käyttäjä ei ole editor-roolissa vaan roolissa {this.props.appState.userRole} </div>)
	}
	return([])
	}

		return(
		<div> CreateDBarea </div>
	)
    }

}


class SettingsArea extends OpenCloseArea {
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

class AddRowArea extends OpenCloseArea {

    render() {

	if (!this.props.appState.dbId) {
	    if (DEBUG) {
		return(<div style={debugstyle}> debug: AddRowArea ei näy koska tietokantaa ei ole valittu </div>)	    }	    
	    return([])	    
	}
	
	
	if (this.props.appState.userRole!=="editor") {

	    if (DEBUG) {
		return(<div style={debugstyle}> debug: AddRowArea ei näy koska käyttäjä ei ole editor-roolissa vaan roolissa {this.props.appState.userRole} </div>)
	    }
	    
	    return([])
	}

	return(
		<div> AddRowArea </div>
	)
	

	}
}

class ContentsArea extends OpenCloseArea {
    render() {
	
	if (!this.props.appState.dbId) {
	    if (DEBUG) {
		return(<div style={debugstyle}> debug: ContentsArea ei näy koska tietokantaa ei ole valittu </div>)	    }	    
	    return([])	    
	}

	
	return(
	    <div> ContentsArea </div>
	)
    }

}


class LoginPage extends React.Component {
    render() {
	return(
	    <div> LoginPage </div>
	)
    }   
}


class NavBar extends React.Component {
    render() {
	return(
	    <div> NavBar </div>
	)
    }   
}

class App extends React.Component {


    //======================================================================
    constructor(props) {
	super(props)
	this.state = {
	    pageState: "browse",
	    userId: "",
	    userName: "",
	    sessionToken: "",
	    userRole: "visitor",
	    dbId: "",
	    dbName: "",
	    dbRows: [],
	    dbTemplate: {}
	}
    } // constr

        //======================================================================
    appToBrowseState = () => { this.setState({pageState: "browse"}) }
    appToSignupState = () => { this.setState({pageState: "signup"}) }
    appToSigninState = () => { this.setState({pageState: "signin"}) }



  //======================================================================
    fetchAndProcess = (path, req, logname, gotDataFun) => {
	
	if (req.mode==="cors")
	{
	    console.log("fetchAndProcess: "+logname+" HUOM cors-moodi päällä");
	}

	fetch(path,req)          
            .then( (response) => {
                if (response.ok) {
                    response.json().then( (data) => { gotDataFun(data) } )
			.catch( (error) => { console.log(logname+": Failed to handle JSON: "+error); }
			);
                } // if ok
                else { console.log(logname+": Server says non-ok status: "+response.status); }
            }) // then		 
            .catch( (error) =>
                    { console.log(logname+": Server says error: "+error); }
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
    }

    makePostReq = (info) => {
	let req = this.makeReq();
	req["method"]="POST";
	req["body"]=JSON.stringify(info);
    }

    
    //======================================================================
    
    handleSignUp = (userName, password) => {
	console.log("KESKEN: signup");
	this.handleSignIn(userName, password);
    }

    handleSignIn = (userName, password) => {
	console.log("KESKEN: signin");
	this.appToBrowseState();
    }

    handleSignOut = () => {
	console.log("KESKEN: signout");

	/*
	KESKEN
	liian mutkikasta valvoa frontendissä tietokantaan pääsyä,
	pyydä BE:ltä uusi tilanne (esim nykykanta voi olla täysin kielletty tai osin auki nyt)
*/
	
	this.setState({
	    userId: "",
	    userName: "",
	    sessionToken: "",
	    userRole: "visitor",
	})

	
	this.appToBrowseState();
    }

    render() {
	const functionList = {handleSignUp:this.handleSignUp,
			      handleSignIn:this.handleSignIn,
			      handleSignOut:this.handleSignOut,
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
		<ChooseDBarea appState={this.state} appFuns={functionList}/>
		<CreateDBarea appState={this.state} appFuns={functionList}/>
		<SettingsArea appState={this.state} appFuns={functionList}/>
		<AddRowArea appState={this.state} appFuns={functionList}/>
		<ContentsArea appState={this.state} appFuns={functionList}/>
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
    getDBlist = () =>{	
            let req = makeGetReq();
	console.log("getDBlist alota ");

	this.fetchAndProcess('/epdb/meta/', req, "App.js/getDBlist", (data) => {

	    console.log("getDBlist data ",data.dbNames)
	    
	    let newState = StateHelper.copyStateWithMods(this.state, "dbNames", data.dbNames);
	    //let newState = this.state;
	    //console.log("xxx=",data.dbNames.map((name)=>{return(name)}))
	    //newState.dbNames = data.dbNames.map((name)=>{return(name)});
	    this.setState(newState);
	    //console.log("getDBlist/tila ",this.state)
	} );     
    } // get content

    
    //======================================================================
    getDBinfo = () => {

        let req = {
            method: "GET",
            mode: "cors",
            headers: {"Content-type":"application/json"}
        }

	
	this.fetchAndProcess('/epdb/meta/'+this.state.dbId, req, "App.js/getDBinfo", (data) => {
	    let newState = StateHelper.copyStateWithMods(this.state, "currentDBname", data.currentDBname);
	    newState = StateHelper.copyStateWithMods(newState, "dbTemplate", data.dbTemplate);
	    this.setState(newState);


	} );     
    } // get content


    //======================================================================
    getDBcontent = () => {

        let req = {
            method: "GET",
            mode: "cors",
            headers: {"Content-type":"application/json"}
        }

	this.fetchAndProcess('/epdb/content/'+this.state.userId+"/"+this.state.dbId, req, "App.js/getDBcontent", (data) => {

	    //	    console.log('S1',this.state)
	    let newState = StateHelper.copyStateWithMods(this.state, "dbRows", data);
	    this.setState(newState);
	    //	    	    console.log('S2',this.state)
	    
	} );     
    } // get content


    //======================================================================
    // elinkaaren osa
    componentDidMount() {
	this.getDBlist();
    }

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
    chooseDB = (dbId) => {

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

    //======================================================================
    // tämä outo välivaihe tulee siitä että ensin alhaalta
    // kutsuttiin suoraan erikseen, parempi olisi yhistää
    handleLogin = (userName, dbId) => {
	console.log("KESKEN: poista dbvalinta loginista");

        let req = {
            method: "POST",
            mode: "cors",
            headers: {"Content-type":"application/json"},
	    body: JSON.stringify({userName: userName})
        }


	console.log("FE, App, login ")
	this.fetchAndProcess('/epdb/login', req, "App.js/login", (data)=>{
	    this.getDBlist();

	
	    this.setUserIdentity(userName, data.userId);
	this.chooseDB(dbId);
	});


    }

        //======================================================================
    handleLogout = () => {
	let isAdmin=false;	
	this.setUserIdentity("_nobody",isAdmin);
    }

        //======================================================================
    createDB = (info) => {
	//	info.dbTemplate
	//	info.dbName


        let req = {
            method: "POST",
            mode: "cors",
            headers: {"Content-type":"application/json"},
	    body: JSON.stringify(info)
        }

	console.log("FE, App ",info)
	console.log("FE, App jsonstr", JSON.stringify(info))
	this.fetchAndProcess('/epdb/meta/'+this.state.userId, req, "App.js/createDB", ()=>{
	    this.getDBlist();
	});

    }
    
    //======================================================================
    render() {


	
	console.log("KORJAA: staten kanssa ei tartte hölmöä copya aina, setState osaa ")
	
	if (this.state.userName === "_nobody") {
	    return(
		    <Login
		//sendUpUserId = {this.setUserIdentity}
		//sendUpDBid = {this.chooseDB}
		dbNames={this.state.dbNames}
		sendUpLogin={this.handleLogin}
		    />
	    )}


        return(
                <div className="App">
		<MainLayout
	    dbNames={this.state.dbNames}
	    dbId={this.props.dbId}	    
	    userId={this.state.userId}
	    userIsAdmin={this.state.userIsAdmin}
	    currentDBname = {this.state.currentDBname}
	    dbRows={this.state.dbRows}
	    dbTemplate={this.state.dbTemplate}	    
	    sendUpDBchange={this.changeDBState}
	    sendUpDBid = {this.chooseDB}
	    sendUpLogout={this.handleLogout}
	    sendUpDBcreate={this.createDB}
		/>
                </div>      
        )
    }
}

*/

export default App;
