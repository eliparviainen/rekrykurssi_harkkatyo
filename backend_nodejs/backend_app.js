const express = require('express');
const mongoose = require('mongoose');
const bcrypt =  require("bcrypt");
const https = require('https');
const fs = require('fs');

const ifVerbose = require('./backend_verbose')


DEFAULT_TTL = 1000*60*60;
//DEFAULT_TTL = 5000;


let app = express();
app.use(express.json());



// ============================================================
// mongoDB + mongoose
// ============================================================


mongoDB = 'mongodb://localhost/epdb_databases';
// optioilla saa deprecationeja pois
// (jotkut ominaisuudet vanhenneet, nämä sanoo että käyttää uutta)
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });


// ============================================================
// databases needed for backend
// ============================================================

const DBiface = require('./epdb_dbinterface_mongoose');

let epdbUserDef = new mongoose.Schema({
    userName : { type: String, required: true },
    password : { type: String, required: true },
});
epdbUser = mongoose.model('epdbUser', epdbUserDef );


let epdbDatabaseSchemaDef = new mongoose.Schema({
    _creator : { type: mongoose.Schema.Types.ObjectId, ref: 'epdbUser', required: true },
    _timestamp: { type: Date, default: Date.now() },
    dbName : { type: String, required: true },
    dbDescription : { type: String, required: false },
    dbTemplate : { type: Object, required: true },
    allowedUsers : [ { type: mongoose.Schema.Types.ObjectId, ref: 'epdbUser', required: false } ],    
});
epdbDatabaseSchema = mongoose.model('epdbDatabaseSchema', epdbDatabaseSchemaDef );


let epdbSessionDef = new mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'epdbUser', required: true },
    token : { type: String, required: true },
    livesUntil : { type: Number, required: true },
    signoutAfterMilliseconds : { type: Number, default: DEFAULT_TTL }
});

epdbSession = mongoose.model('epdbSession', epdbSessionDef );


// ============================================================
// routes
// ============================================================


let userRouter = express.Router();
app.use("/epdb/user", userRouter);
userRouter.post('/signup', signup_post);
userRouter.post('/signin', signin_post);
userRouter.post('/signout/:userId', checkSigninStatus, signout_post);


let schemaRouter = express.Router();
app.use("/epdb/structure", checkSessionLife, checkContents, schemaRouter);
schemaRouter.post('/:userId', checkSigninStatus, schemas_create);
schemaRouter.get('/:userId', schemas_readAll);
schemaRouter.get('/:userId/:dbId', checkDBaccess, schemas_readOne);


let contentRouter = express.Router();
app.use("/epdb/content", checkSessionLife, checkDBaccess, checkContents, contentRouter);
contentRouter.get('/:userId/:dbId', content_readAll);
// contentRouter.get('/:userId/:dbId/:rowId', checkRowAccess, content_readOne);
contentRouter.post('/:userId/:dbId', checkSigninStatus, content_create);
contentRouter.put('/:userId/:dbId/:rowId', checkSigninStatus, checkRowAccess, content_edit);
contentRouter.delete('/:userId/:dbId/:rowId', checkSigninStatus, checkRowAccess, content_delete);



// ============================================================
// PLACEHOLDERS, muista toteuttaa nämä
// ============================================================

const KESKENERANEN_KOODI_POIS_PAALTA = true;

function checkSessionLife(req, res, next) {

    if (KESKENERANEN_KOODI_POIS_PAALTA)
    {
	console.log("checkSessionLife TOTEUTTAMATTA");
	return next();
    }
	
    ifVerbose("checkSessionLife, enter");

    console.log("checkSessionLife, params",req.params);
    console.log("checkSessionLife, uid",req.params.userId);

    if (!req.params.userId) { return next(); }

    
    DBiface.findSessionByUID(req.params.userId, (err, session) => {
	console.log("checksession, sessio",session)
	
	if (!session||isEmpty(session)) { return next(); }
	console.log("checksession, now",Date.now())
	console.log("checksession, livesuntil",session.livesUntil)
	if (Date.now()>session.livesUntil) {	    
	    return res.status(403).json({msg: "session timed out"});
	} else {
	    session.livesUntil = Date.now() + session.signoutAfterMilliseconds;
	    console.log("designrikko: backend-app kutsuu suoraan mongoosea");
	    let sessObj = new epdbSession(session);
	    sessObj.save((err, session) => {
		if (!session) { return res.status(403).json({msg: "session problem"}); }
		if (err) { return res.status(403).json({msg: "session problem"}); }
		return next();
	    })  // save
	}
    }) // find
}

function checkSigninStatus(req, res, next) {

    if (KESKENERANEN_KOODI_POIS_PAALTA)
    {
	console.log("checkSigninStatus TOTEUTTAMATTA");
	return next();
    }

    ifVerbose("checkSigninStatus, enter");

    console.log("tarkista token?")
    
    DBiface.findSessionByUID(req.params.userId, (err, session) => {
	if (!session) { return res.status(403).json({msg: "user not logged in"}); }
	if (err) { return res.status(403).json({msg: "user not logged in"}); }
	return next();
    }) // find
}

function checkDBaccess(req, res, next) {
    ifVerbose("checkDBaccess, enter");
    console.log("TOTEUTTAMATTA: checkDBaccess");
    return next();    
}

function checkContents(req, res, next) {

    ifVerbose("checkContents, enter");
    /*
ei hyvä, numero nimeltä "EMPTY" ei toimi
    if (req.body) {
	for (key in req.body) {
	    if (isEmpty(req.body[key])) {
		req.body[key] = "EMPTY";
	    }
	}
    }
*/
    console.log("TOTEUTTAMATTA: checkContents");
    return next();    
}


function checkRowAccess(req, res, next) {

    /*
        DBiface.getOneRow(req.params.userId, req.params.dbId, req.params.rowId, (err, oldRow) => {
	if (err) { return res.status(409).json({msg: "row not saved"}); }
	if (!oldRow) { return res.status(404).json({msg: "row not found"}); } 
	}) // getOneRow
    */

    console.log("TOTEUTTAMATTA: checkRowAccess");
    return next();    
}




// ============================================================
// errors
// ============================================================

function passOnError(res, err) {
    console.log("virhekäsittelijä voisi sanoa jotain fiksumpaakin kuin server error");
    return unknownError(res, err);
}

function unknownError(res, err) {
    if (err) { console.log("unknown error handler: ", err) }
    return res.status(500).json({msg: "something could be wrong"})
}

// 403 = forbidden
function signInError(res, err) {
    if (err) { console.log("sign-in error handler: ", err) }
    return res.status(403).json({msg: "could not sign in"})
}

// 422 = unprocessable entity
function signUpError(res, err) {
    if (err) { console.log("sign-up error handler: ", err) }
    res.status(422).json({msg: "could not sign up"})
}

// 409 = conflict
function userNameConflict(res, userName) {
    return res.status(409).json({msg: "username "+userName+" taken"}) 
}

// ============================================================
// maintenance routes
// ============================================================


function schemas_readAll(req, res) {
ifVerbose("entering schemas_readAll")

    //  console.log("sending", { "title": dbTitle, "template": dbTemplate})

    //    return (DBlistDBs(res));

    console.log("kutsuttu schemas_readAll, user=",    req.params.userId);

    console.log("sanitointi: jos userid on tyhjä jono tms muuta nollaksi (joka on eikukaan)");

    
    DBiface.listDBs(req.params.userId, (err, dbList) => {
			if (err) { return passOnError(res, err) }
			//console.log(dbNames)
			return res.status(200).json({ "dbList": dbList})
		    });    
}


function schemas_readOne(req, res) {
ifVerbose("entering schemas_readOne")

    DBiface.getHeader(req.params.userId, req.params.dbId,
		      (err, data) => {
			  if (err) { return passOnError(res, err) }
			  //console.log("schemas_readOne, got header ",data)
			  return res.status(200).json({ "dbId": data._id, "dbName": data.dbName,
							"dbDescription": data.dbDescription,
							"dbTemplate": data.dbTemplate});
		      })
}



function schemas_create(req, res) {
ifVerbose("entering schemas_create")

    DBiface.createDB(req.params.userId, req.body, (err, schema) => {
	if (err) { return passOnError(res, err) }
	// send name since in case of duplicates the server modifies it
	return res.status(200).json({ dbName: schema.dbName, dbId: schema._id })
    });
}



// ============================================================
// signin routes
// ============================================================

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function signup_post(req, res) {
ifVerbose("entering signup_post")


    DBiface.findUserByName(req.body.userName, (err, user) => {
	//console.log("findUserByName palasi");
	
	if (err) { return passOnError(res, err) }


	//console.log ("user=",user)
	if (!isEmpty(user)) { return userNameConflict(res, user.userName) }

	//console.log ("onko täällä?")
	bcrypt.hash(req.body.password, 10, function(err,hash) {
	    if (err) { return signupError(res, err) }

	    DBiface.createUser(req.body.userName, hash, 
			       function(err, newUser) {
				   if (err) { return passOnError(res, err) }
				   return res.status(200).json({userId: newUser._id})
			       }) // create	    	    
	}) // bcrypt		 
    }) // find by name
}


function signin_post(req, res) {
ifVerbose("entering signin_post")


    DBiface.findUserByName(req.body.userName, (err, user) => {
	if (err) { return signInError(res, err) }

	//console.log("signin:in löytämät käyttäjätiedot",user)
	bcrypt.compare(req.body.password, user.password, function(err, success) {

	  //  console.log("signin bcryptcompare err",err)
	  //  console.log("signin bcryptcompare success",success)
	    
	    if (err) { return signInError(res, err) }
	    if (!success) { return signInError(res, err) }
	    
	    DBiface.findSessionByUID(user, (err, existingSession) => {
		if (err) { return passOnError(res, err) }
		//console.log("existingSession=",existingSession)
		if (existingSession) {
		    return res.status(200).json({userId: user._id, sessionToken: existingSession.token})
		}
		
		console.log("POISTA: debugviestien siistimiseksi token vain 16 merkkiä");
		let aux = 'abcdefghijklmnopqrstuvxyz0123456789';
		newToken = 'TOKEN';
		for (let i=0; i<16; i++) {
		    newToken += aux[Math.floor(Math.random()*aux.length)];
		}
		//console.log(newToken)

		DBiface.newSession({
		    userId : user,
		    token : newToken,
		    livesUntil : Date.now() + DEFAULT_TTL,
		    signoutAfterMilliseconds : DEFAULT_TTL
		}, function(err, session) {
		    if (err) { return passOnError(res, err) }
		    return res.status(200).json({userId: user._id, token: session.token})
		}) // newSession
	    }) // find session by userId
	}) // bcrypt check password
    }) // find userId by name
}


    
function signout_post(req, res) {
    ifVerbose("entering signout_post")

    // implicit assumption of a user having only one session
    // (if a user can have many sessions, the session token must be used to tell them apart)
    DBiface.deleteSession(req.params.userId, (err) => {
		if (err) { return passOnError(res, err) }
		return res.status(200).json({msg: "signed out"})
    }) // delete
    
    /*
    DBiface.findSessionByUID(req.params.userId, (err, session) => {
	console.log("signout löyti session",session)
	if (err) { return passOnError(res, err) }
	if (session) {
	DBiface.deleteSession(session, (err) => {
		if (err) { return passOnError(res, err) }
		return res.status(200).json({msg: "signed out"})
	    }) // delete
	} // if
	return res.status(200).json({msg: "signed out"})
    }) // find
*/
}



// ============================================================
// content routes
// ============================================================

			     
function content_readAll(req, res) {
ifVerbose("entering content_readAll")

    
    DBiface.getAllRows(req.params.userId, req.params.dbId, (err, dbRows) => {
	if (err) { return res.status(200).json([]); }	
	return res.status(200).json(dbRows);
    })
}


/*
will this ever be needed?

function content_readOne(req, res) {
ifVerbose("entering content_readOne")

    
    DBiface.getOneRow(req.params.dbId, req.params.userId, req.params.rowId, (err, dbRow) => {
	if (err) { return res.status(200).json([]); }	
	return res.status(200).json(dbRow);
    })
}
*/

function content_delete(req, res) {
ifVerbose("entering content_delete")


//    console.log(req.params.rowId)

    DBiface.deleteRow(req.params.userId, req.params.dbId, req.params.rowId, (err) => {
	if (err) { return res.status(404).json({msg:"row not found"}) }
	return res.status(200).json([]);
    })
}


function content_create(req, res) {
ifVerbose("entering content_create")

//    console.log('content_create req',req.body)
    DBiface.createRow(req.params.userId, req.params.dbId, req.body, (err, newRow) => {
//	console.log("content_create, err", err)
//	console.log("content_create, newrow", newRow)
	if (err) {
	    //console.log("err-haara");
	    return res.status(409).json({msg: "row not added"});
	} 
    	return res.status(200).json(newRow);
    })
}

		     
function content_edit(req, res) {
ifVerbose("entering content_edit")

// tänne tullessa olettaa että editointioikeus riviin on tarkastettu jo
    DBiface.updateRow(req.params.userId, req.params.dbId, req.body, (err, updatedRow) => {
	    if (err) { return res.status(409).json({msg: "row not saved"}); } 
    	    return res.status(200).json(updatedRow);
	}) // editRow
}


// ============================================================
// create server
// ============================================================


			     /*
app.get('/', function (req, res) {
        res.send("Hello World! -- xxxx");

});
*/


let sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

//http.createServer(app).listen(8443);
https.createServer(sslOptions, app).listen(1111,
					   function()
{
    //let hostport = app.address().port;
	console.log("Express server is listening at 1111 -- HTTPS, ite allekirjotettu sertifikaatti");
//	console.log("Port is: %s", hostport);
}
					  )


/*
// Start nodeJS server
let server = app.listen(1111, function()
{
	let hostport = server.address().port;
	console.log("Express server is listening");
	console.log("Port is: %s", hostport);
});
*/


