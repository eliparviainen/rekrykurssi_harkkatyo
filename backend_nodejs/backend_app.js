const express = require('express');
const mongoose = require('mongoose');
require('mongoose-type-url');
const bcrypt =  require("bcrypt");
const https = require('https');
const fs = require('fs');

DEFAULT_TTL = 1000*60*60;


let app = express();
app.use(express.json());


let verbose=true;
function ifVerbose(msg) {
    console.log(msg);
}

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
    dbDescription : { type: String, required: true },
    dbTemplate : { type: Object, required: true },
    allowedUsers : [ { type: mongoose.Schema.Types.ObjectId, ref: 'epdbUser', required: true } ],    
});
epdbDatabaseSchema = mongoose.model('epdbDatabaseSchema', epdbDatabaseSchemaDef );


let epdbSessionDef = new mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'epdbUser', required: true },
    token : { type: String, required: true },
    livesUntil : { type: Date, required: true },
    signoutAfterMilliseconds : { type: Number, default: DEFAULT_TTL }
});

epdbSession = mongoose.model('epdbSession', epdbSessionDef );


// ============================================================
// routes
// ============================================================

// routes check access based on user status (visitor, editor, owner)
// access set by owner can restrict access to part of information, checked later

let visitorRouter = express.Router();
visitorRouter.use("/epdb/visitor", visitorRouter);

visitorRouter.get('/list', dblist_get);
visitorRouter.get('/list/:userId/:dbId', dbstructure_get);
visitorRouter.get('/content/:userId/:dbId', content_get);

visitorRouter.post('/signup', signup_post);
visitorRouter.post('/signin', signin_post);

let editorRouter = express.Router();
app.use("/epdb/editor",checkSessionLife, checkSigninStatus, checkDBaccess, editorRouter);

editorRouter.post('/content/:userId/:dbId', content_post);
editorRouter.put('/content/:userId/:dbId/:rowId', content_put);
editorRouter.delete('/content/:userId/:dbId/:rowId', content_delete);
editorRouter.post('/signout', signout_post);

let ownerRouter = express.Router();
app.use("/epdb/owner",checkSessionLife, checkSigninStatus, checkDBaccess, checkOwnership, ownerRouter);
ownerRouter.post('/list/:userId', dblist_post);

// ============================================================
// PLACEHOLDERS, muista toteuttaa nämä
// ============================================================



function checkSessionLife(req, res, next) {
    console.log("TOTEUTTAMATTA: checkSessionLife");
    return next();    
}

function checkSigninStatus(req, res, next) {
    console.log("TOTEUTTAMATTA: checkSigninStatus");
    return next();    
}

function checkDBaccess(req, res, next) {
    console.log("TOTEUTTAMATTA: checkDBaccess");
    return next();    
}


function checkOwnership(req, res, next) {
    console.log("TOTEUTTAMATTA: checkOwnership");
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

function signInError(res, err) {
    if (err) { console.log("sign-in error handler: ", err) }
    return res.status(403).json({msg: "could not sign in"})
}

function signUpError(res, err) {
    if (err) { console.log("sign-up error handler: ", err) }
    res.status(422).json({msg: "could not sign up"})
}

function userNameConflict(res, userName) {
    return res.status(409).json({msg: "username "+userName+" taken"}) 
}

// ============================================================
// maintenance routes
// ============================================================


function dblist_get(req, res) {
ifVerbose("entering dblist_get")

    //  console.log("sending", { "title": dbTitle, "template": dbTemplate})

    //    return (DBlistDBs(res));

    console.log("kutsuttu dblist_get");

    DBiface.listDBs(req.body.userId,
		    (err, dbNames) => {
			if (err) { return passOnError(res, err) }
			//console.log(dbNames)
			return res.status(200).json({ "dbNames": dbNames})
		    });    
}


function dbstructure_get(req, res) {
ifVerbose("entering dbstructure_get")

    DBiface.getHeader(req.params.userId, req.params.dbId,
		      (err, dbName, dbDescription, dbTemplate) => {
			  if (err) { return passOnError(res, err) }
			  return res.status(200).json({ "dbName": dbName,
							"dbDescription": dbDescription,
							"dbTemplate": dbTemplate});
		      })
}



function dblist_post(req, res) {
ifVerbose("entering dblist_post")

    DBiface.create(req.params.userId, req.body, (err, dbId) => {
	if (err) { return passOnError(res, err) }
	return res.status(200).json({ dbId: dbId })
    });
}



// ============================================================
// signin routes
// ============================================================


function signup_post(req, res) {
ifVerbose("entering signup_post")


    DBiface.findUserByName(req.body.userName, (err, user) => {

	if (err) { return passOnError(res, err) }
	if (user) { return userNameConflict(res, user.userName) }
    
	bcrypt.hash(req.body.password, 10, function(err,hash) {
	    if (err) { return signupError(res, err) }
	    let newUser = new epdbUser({userName: req.body.userName, password: hash})
	    newUser.save( function(err,res) {
		if (err) { return passOnError(res, err) }
		return res.status(200).json({userId: newUser._id})
	    }) // save
	}) // bcrypt		 
    }) // find by name
}


function signin_post(req, res) {
ifVerbose("entering signin_post")


    DBiface.findUserByName(req.body.userName, (err, user) => {
	if (err) { return signInError(res, err) }

	bcrypt.compare(req.body.password, user.password, function(err, success) {

	    if (err) { return signInError(res, err) }
	    
	    DBiface.findSessionByUID(user, (err, existingSessionID) => {
		if (err) { return passOnError(res, err) }
		if (existingSessionID) {
		    return res.status(200).json({userId: user._id, token: existingSession.token})
		}
		
		console.log("POISTA: debugviestien siistimiseksi token vain 16 merkkiä");
		let aux = 'abcdefghijklmnopqrstuvxyz0123456789';
		newToken = 'TOKEN';
		for (let i=0; i<16; i++) {
		    newToken += aux[Math.floor(Math.random()*aux.length)];
		}
		console.log(newToken)

		DBiface.newSession({
		    userId : user,
		    token : newToken,
		    livesUntil : Date.now + DEFAULT_TTL,
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

    DBiface.findSessionByUID(user, (err, session) => {
	if (err) { return passOnError(res, err) }
	if (existingSessionID) {
	    DBiface.deleteSession(session, (err) => {
		if (err) { return passOnError(res, err) }
		return res.status(200).json({msg: "signed out"})
	    }) // delete
	} // if
	return res.status(200).json({msg: "signed out"})
    }) // find
}



// ============================================================
// content routes
// ============================================================

			     
function content_get(req, res) {
ifVerbose("entering content_get")

    
    DBiface.getRows(req.params.dbId, req.params.userId, (err, dbRows) => {
	if (err) { return res.status(200).json([]); }	
	return res.status(200).json(dbRows);
    })
}


function content_delete(req, res) {
ifVerbose("entering content_delete")


//    console.log(req.params.rowId)

    DBiface.deleteRow(req.params.dbId, req.params.userId, req.params.rowId, (err) => {
	if (err) { return res.status(404).json({msg:"row not found"}) }
	return res.status(200).json([]);
    })
}


function content_post(req, res) {
ifVerbose("entering content_post")

    
    let newRow = DBiface.newRow(req.params.dbId, req.params.userId, req.body);

    DBiface.addRow(newRow, (err) => {
	if (err) { return res.status(409).json({msg: "row not saved"}); } 
    	return res.status(200).json(newRow);
    })
}

		     
function content_put(req, res) {
ifVerbose("entering content_put")


    DBiface.getOneRow(req.params.dbId, req.params.userId, req.params.rowId, (err, oldRow) => {
	if (err) { return res.status(409).json({msg: "row not saved"}); }
	if (!oldRow) { return res.status(404).json({msg: "row not found"}); } 
	
	DBiface.editRow(oldRow, req.body, (err, updatedRow) => {
	    if (err) { return res.status(409).json({msg: "row not saved"}); } 
    	    return res.status(200).json(updatedRow);
	}) // editRow
    }) // getOneRow
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
	console.log("Express server is listening -- HTTPS, ite allekirjotettu sertifikaatti");
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


