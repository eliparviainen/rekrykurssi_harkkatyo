const express = require('express');
const mongoose = require('mongoose');
require('mongoose-type-url');
const bcrypt =  require("bcrypt");
const https = require('https');
const fs = require('fs');

DEFAULT_TTL = 1000*60*60;


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

console.log("HUOM ei ole ollenkaan /-reittiä");

app.get('/epdb/structure', dblist_get);
app.get('/epdb/structure/:dbId', dbinfo_get);
app.post('/epdb/structure/:userId', dblist_post);

app.post('/epdb/signup', signup_post);
app.post('/epdb/signin', signin_post);
app.post('/epdb/signout', signout_post);

let contentRouter = express.Router();
contentRouter.get('/:userId/:dbId', content_get);
contentRouter.post('/:userId/:dbId', content_post);
contentRouter.put('/:userId/:dbId/:rowId', content_put);
contentRouter.delete('/:userId/:dbId/:rowId', content_delete);
app.use("/epdb/content",checkSigninStatus, checkDBaccess, contentRouter);

// ============================================================
// PLACEHOLDERS, muista toteuttaa nämä
// ============================================================

console.log("PUUTTUU: muista laittaa elinajan lisäys jonnekin");

function checkSigninStatus(req, res, next) {
    console.log("TOTEUTTAMATTA: checkSigninStatus");
    return next();    
}

function checkDBaccess(req, res, next) {
    console.log("TOTEUTTAMATTA: checkSigninStatus");
    return next();    
}

// ============================================================
// errors
// ============================================================

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
    return res.status(409).json({msg: "username "+userName+" taken"}) }
}



// ============================================================
// signin routes
// ============================================================


function signup_post(req, res) {

    DBiface.findUserByName(req.body.userName, (err, user) => {

	if (err) { return unknownError(res, err) }
	if (user) { return userNameConflict(res, user.userName) }
    
	bcrypt.hash(req.body.password, 10, function(err,hash) {
	    if (err) { return signupError(res, err) }
	    let newUser = new epdbUser({userName: req.body.userName, password: hash})
	    newUser.save( function(err,res) {
		if (err) { return unknownError(res, err) }
		return res.status(200).json({userId: newUser._id})
	    }) // save
	}) // bcrypt		 
    }) // find by name
}


function signin_post(req, res) {

    DBiface.findUserByName(req.body.userName, (err, user) => {
	if (err) { return signInError(res, err) }

	bcrypt.compare(req.body.password, user.password, function(err, success) {

	    if (err) { return signInError(res, err) }
	    
	    DBiface.findSessionByUID(user, (err, existingSessionID) => {
		if (err) { return unknownError(res, err) }
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
		}, (function(err, session) {
		    if (err) { return unknownError(res, err) }
		    return res.status(200).json({userId: user._id, token: session.token})
		}) // newSession
	    }) // find session by userId
	}) // bcrypt check password
    }) // find userId by name
}


    
function signout_post(req, res) {

    DBiface.findSessionByUID(user, (err, session) => {
	if (err) { return unknownError(res, err) }
	if (existingSessionID) {
	    DBiface.deleteSession(session, (err) => {
		if (err) { return unknownError(res, err) }
		return res.status(200).json({msg: "signed out"})
	    }) // delete
	}
	return res.status(200).json({msg: "signed out"})
    }



// ============================================================
// content routes
// ============================================================

/*
    tänne tullessa oletetaan:
	- käyttäjä logannut sisään
	- käyttäjä saa lukea tietokantaa
*/


function content_get(req, res) {
    
    DBiface.getRows(req.params.dbId, req.params.userId, (err, dbRows) => {
	if (err) { return res.status(200).json([]); }	
	return res.status(200).json(dbRows);
    })
}


function content_delete(req, res) {

//    console.log(req.params.rowId)

    DBiface.deleteRow(req.params.dbId, req.params.userId, req.params.rowId, (err) => {
	if (err) { return res.status(404).json({msg:"row not found"}) }
	return res.status(200).json([]);
    })
}


function content_post(req, res) {
    
    let newRow = DBiface.newRow(req.params.dbId, req.params.userId, req.body);

    DBiface.addRow(newRow, (err) => {
	if (err) { return res.status(409).json({msg: "row not saved"}); } 
    	return res.status(200).json(newRow);
    })
}

		     
function content_put(req, res) {

    DBiface.getOneRow(req.params.dbId, req.params.userId, req.params.rowId, (err, oldRow) => {
	if (err) { return res.status(409).json({msg: "row not saved"}); }
	if (!oldRow) { return res.status(404).json({msg: "row not found"}); } 
	
	DBiface.editRow(oldRow, req.body, (err, updatedRow) => {
	    if (err) { return res.status(409).json({msg: "row not saved"}); } 
    	    return res.status(200).json(updatedRow);
	}) // editRow
    }) // getOneRow
}

// ################################################################################
// EKASTA HAHMOTELMASTA, SIIVOTTAVAA/POISTETTAVAA KOODIA
// ################################################################################

// ============================================================
// database interface
// ============================================================


//const DBiface = require('./epdb_dbinterface_feikki');
const DBiface = require('./epdb_dbinterface_mongoose');




// ========================================
// feikkikannat

    
    function newSession(sessionData, sendFun) {
	let newSession = new epdbSession(sessionData);
	newSession.save(sendFun);
    }

    
function DBfindSessionByUID(userId, readyFun) {
    epdbSession.find({userId: userId}, (err, sessionEntry) => {

	if (!sessionEntry) { readyFun(err,[]) }
	if (sessionEntry.length>1) {
	    console.log("PÄÄTÄ JO: saako samalla käyttäjällä olla auki useampi sessio?");
	}
	sessionEntry = sessionEntry[0];
	
	    readyFun(err,sessionEntry)	
    }) // find
}


function DBfindUserByName(userName, readyFun) {
    epdbUser.find({userName: userName}, (err, userEntry) => {

	console.log("DBfindUserByName ettii käyttäjää ",userName)
	if (!userEntry) { readyFun(err,[]) }
	
	if (userEntry.length>1) {
	    console.log("PUUTTUU: ei saisi olla useampaa samannimistä käyttäjää (feikkikannassa voi olla)");
	}
	userEntry = userEntry[0];
	
	readyFun(err,userEntry._id)	
    }) // find
}



// ============================================================
// mongoose interface
// ============================================================


function mongooseInsertRow(dbSchema, rowContents, userId) {
   
    let modelName = "schemaFor"+dbSchema.id;
    let schemaDefJson = mongooseJsonFromTemplate(dbSchema.dbTemplate);
    let newDB = mongoose.model(modelName, schemaDefJson);

    //console.log('kanta '+dbSchema.dbName+' luotu (jos ei sitä ollut jo)');

	// 
//    LISÄÄ TÄSSÄ ROSKAA KANTAAN    (tapahtuuko kanta sillon mongossa?)


    rowContents = epdbAddDefaultFields(rowContents, userId)
	
    // pitäisi vastata new Luokka -komentoa?
	//newRow = Object.create(newDB); // , rowContents
    newRow = new newDB(rowContents);

    //let teese = false;
        let teese = true;
    if (teese) {
    //	TARKISTA RIVIN MUOTO, LAITTAA NYT SUORAAN ROSKAKANNASTA, ERI KENTÄT
    newRow.save(function(err, res) {
	if (err) throw err;
	//console.log('rivi '+newRow+' lisätty');
	console.log('rivi lisätty kantaan '+modelName);
    });

    }

    // muuten valittaa että on jo
    mongoose.deleteModel(modelName);
    //	console.log("rivi "+i+" ",newRow)
}

    
function mongooseCreateDatabase(dbName, dbTemplate, userEntry) {

    // edellä pitää olla tarkistettu:
    // - tietokantaa ei ennestään ole
    // - käyttäjällä on lupa luoda kantoja

    
let dbSchema = new epdbDatabaseSchema(
    {
	dbName: dbName,	
	dbTemplate: dbTemplate,
	_creator: userEntry
    }
);
dbSchema.save(function(err, res) {
                if (err) throw err;
                console.log('kanta '+res.dbName+' lisätty listaan');
        });

//console.log(schemaDefJson)

    return(dbSchema) //, modelName: modelName});
}

function epdbAddDefaultFields(record, userId) {
    record["_timestamp"] = Date.now();
    record["_owner"] = userId;
    console.log("KESKEN: _isPublic ei riitä julkisuusmekanismiksi (private,shared,moderator-locked")
    record["_isPublic"] = true;

    return(record)
}
    
function mongooseJsonFromTemplate(templateForAddingDB) {
let schemaDefJson = {};
let enumTypeList = [];
for (let fieldname in templateForAddingDB.enums) { enumTypeList.push(fieldname) };
//console.log(enumTypeList)
//console.log(enumTypeList.includes("enum2"))
schemaDefJson["_timestamp"] = { type: Date, default: Date.now() };
schemaDefJson["_owner"] = { type: mongoose.Schema.Types.ObjectId, ref: 'epdbUser', required: true };
schemaDefJson["_isPublic"] =  { type: Boolean, default: false };

for (let fieldname in templateForAddingDB.fieldTypes) {

    // enumTypeList.includes(templateForAddingDB.fieldTypes[fieldname])) {
    let enumInd = enumTypeList.indexOf(templateForAddingDB.fieldTypes[fieldname]);
    if (enumInd>=0) {
	schemaDefJson[fieldname] = { type: String, enum: templateForAddingDB.enums[enumTypeList[enumInd]] };

    } else {
	switch(templateForAddingDB.fieldTypes[fieldname]) {
	case "text":
	case "string":
	    schemaDefJson[fieldname] = { type: String };
	    break;
	case "URL":
	    console.log("KESKEN: joko frontendissä on URL-render?");
	    // tarttee: npm install mongoose-type-url
	    schemaDefJson[fieldname] = { type: mongoose.SchemaTypes.Url };
	    break;
	case "number":
	    schemaDefJson[fieldname] = { type: Number };
	    break;
	}
    }
//    schemaDefJson[fieldname] = 
}
//    console.log(schemaDefJson)
    return(schemaDefJson);
}



// ============================================================
// HTTP requests
// ============================================================



//app.put('/epdb/meta/:userId', dblist_put);
function dblist_post(req, res) {
  
    console.log("MUISTA: kannat tunnistetaan nimillä kun en jaksa päivittää vanhaa koodia, nimien oltava uniikkeja");

    console.log("BE dblistpost ",req.body)
    DBiface.DBcreate(req.params.userId, req.body, () => {
	return res.status(200).json({ "msg": "luotu uusi kanta"})
    });
    /*
    // nää olis parempi kirjottaa .then-ketjuksi mutta pistän toimimaan ensin edes jotenkin
    DBiface.DBcreate(req.params.userId, req.body, () => {

	console.log("create sendfun");
	DBiface.DBlistDBs(
	    (dbNames) => {
		console.log("create->dblists sendfun");
	    console.log(dbNames)
		return res.status(200).json({ "dbNames": dbNames})
	    }
	);
    });
*/
}

function dblist_get(req, res) {
    //  console.log("sending", { "title": dbTitle, "template": dbTemplate})

    //    return (DBlistDBs(res));

    console.log("kutsuttu dblist_get");
    
    DBiface.DBlistDBs(
	(dbNames) => {
	    console.log(dbNames)
	return res.status(200).json({ "dbNames": dbNames})
	}
    );
}


function dbinfo_get(req, res) {
    DBiface.DBinfo(req.params.dbId, (dbTitle, dbTemplate) => {
	return res.status(200).json({ "dbTitle": req.params.dbId+"/"+dbTitle, "dbTemplate": dbTemplate});
    }
	  )}

// ============================================================


app.get('/', function (req, res) {
        res.send("Hello World! -- muista laittaa /-reitti myös varsinaiseen serveriin");

});


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


