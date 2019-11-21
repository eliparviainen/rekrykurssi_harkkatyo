const ifVerbose = require('./backend_verbose')
require('mongoose-type-url');
mongoose=require('mongoose');


function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


module.exports.createUser = function (userName, password, readyFun) {
    let newUser = new epdbUser({userName: userName, password: password})
    return newUser.save(readyFun);
}



module.exports.newSession = function (sessionData, sendFun) {
    let newSession = new epdbSession(sessionData);
    newSession.save(sendFun);
}


module.exports.deleteSession = function (userId, sendFun) {
    epdbSession.deleteOne({userId: userId}, sendFun);
}

    
module.exports.findSessionByUID = function(userId, readyFun) {
    epdbSession.find({userId: userId}, (err, sessionEntry) => {

	if (!sessionEntry) { return readyFun(err,[]) }
	if (sessionEntry.length>1) {
	    console.log("PÄÄTÄ JO: saako samalla käyttäjällä olla auki useampi sessio?");
	}
	sessionEntry = sessionEntry[0];
	
	return readyFun(err,sessionEntry)	
    }) // find
}


module.exports.findUserByName = function(userName, readyFun) {
    epdbUser.find({userName: userName}, (err, userEntry) => {

	console.log("DBfindUserByName ettii käyttäjää ",userName)
	console.log("DBfindUserByName tulos ",userEntry)
	
	if (!userEntry || userEntry.length===0) { return readyFun(err,[]) }
	
	if (userEntry.length>1) {
	    console.log("PUUTTUU: ei saisi olla useampaa samannimistä käyttäjää (feikkikannassa voi olla)");
	    console.log("palauta järkevä virhe")	    
	    throw "username not unique";
	}
	userEntry = userEntry[0];
	
	return readyFun(err,userEntry)	
    }) // find
}





// from stackoverflow
function noDuplicates(arr) {
    console.log("arr=",arr)
    return arr.filter((value, index, self) => self.indexOf(value) === index);
}

//let x = (names) => names.filter((v,i) => names.indexOf(v) === i)
//x(names); 

function epdbSetSystemFields(record, userId) {
    let newRecord = record;
    newRecord["_timestamp"] = Date.now();
    newRecord["_owner"] = mongoose.Types.ObjectId(userId);
    console.log("KESKEN: _isPublic ei riitä julkisuusmekanismiksi (private,shared,moderator-locked")
    newRecord["_isPublic"] = true;

    return(newRecord)
}

function epdbCreateSystemFields(schemaDefJson) {
    schemaDefJson["_timestamp"] = { type: Date, default: Date.now() };
schemaDefJson["_owner"] = { type: mongoose.Schema.Types.ObjectId, ref: 'epdbUser', required: true };
schemaDefJson["_isPublic"] =  { type: Boolean, default: false };
return schemaDefJson
}
    
function mongooseJsonFromTemplate(templateForAddingDB) {
let schemaDefJson = {};
let enumTypeList = [];
for (let fieldname in templateForAddingDB.enums) { enumTypeList.push(fieldname) };
//console.log(enumTypeList)
//console.log(enumTypeList.includes("enum2"))
    schemaDefJson = epdbCreateSystemFields(schemaDefJson);
    
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
	case "url":
	    console.log("KESKEN: joko frontendissä on URL-render?");
	    // tarttee: npm install mongoose-type-url
	    schemaDefJson[fieldname] = { type: mongoose.SchemaTypes.Url };
	    break;
	case "number":
	    schemaDefJson[fieldname] = { type: Number };
	    break;
	default:
	    console.log("tuntematon kentäntyyppi",templateForAddingDB.fieldTypes[fieldname]);
	}
    }
//    schemaDefJson[fieldname] = 
}
//    console.log(schemaDefJson)
    return(schemaDefJson);
}



module.exports.getAllRows = function(userId, dbId, sendFun) {

    ifVerbose("entering iface/getAllRows", dbId)

    epdbDatabaseSchema.find({_id: dbId}, (err, dbEntry) => {

	dbEntry = dbEntry[0];
	
	console.log(dbEntry)
	console.log("tietokanta löyty ", dbEntry.dbName)
	let modelName = "schemaFor"+dbId;	
	let schemaDefJson = mongooseJsonFromTemplate(dbEntry.dbTemplate);
    
	// nämä voisi olemassakin olla mutta yksinkertasin versio luo mallin aina uusiksi
	currentDB = mongoose.model(modelName, schemaDefJson );


	console.log("malli "+modelName+" ",currentDB)

	console.log("uid=",userId)

	let haku = 	    
	    {$or : [ { _owner: userId}, 
		{
		    _owner: { $not: userId},
		    isPublic: true
		}
	    ]
	    }

	console.log("TMP: rivien omistajuus/julkisuustarkastus poissa päältä");
	haku = {}
	
	currentDB.find(haku
	,(err, dbRows) => {

	    if (isEmpty(dbRows)) { return sendFun(err, []) }
	    console.log("currentDB:n rivit ",dbRows)
	
		return sendFun(err, dbRows);
	}) // currentDB.find

	mongoose.deleteModel(modelName)
    }) // dblist.find
}




module.exports.listDBs = function(userId, sendFun) {

    console.log("listdbs, user=",userId)

    epdbDatabaseSchema.find({}, (err, dbEntries) => {
	let dbList = [];
	dbEntries.map( (entry) => {
	    console.log("entry: ",entry);

	    // listing DBs is allowed for all users (even without login), but only
	    // public databases and databases allowed for current user will be shown;
	    // this is why access is checked here and not in the router
	    if (isEmpty(entry.allowedUsers) || (entry._owner===userId) || entry.allowedUsers.includes(userId)) {
		dbList.push({dbName: entry.dbName, dbId: entry._id, dbDescription: entry.dbDescription});
	    }
	}) // map
	//console.log("names=",dbList)
	//return res.status(200).json({ "dbList": dbList});
	return (sendFun(err,dbList));
    }) // find

}


module.exports.getHeader = function(userId, dbId, sendFun) {


    // router has already checked that userId is allowed to access dbId
    // (n.b. is the database is public, even the "nobody" userID===0 can read it)
    
    console.log("list one db, user=",userId)
        console.log("list one db, db=",dbId)

    epdbDatabaseSchema.find({_id: dbId}, (err, dbEntries) => {
	console.log(dbEntries)
	return (sendFun(err,dbEntries[0]));
    }) // find

}

module.exports.createRow = function(ownerId, dbId, rowSpecs, sendFun) {


    ifVerbose("createRow enter");
    
   	
    epdbDatabaseSchema.find({_id:dbId}, (err, dbs) => {

	if (isEmpty(dbs)) { return sendFun(err, []) }	
	let dbSchema = dbs[0];

   
    let modelName = "schemaFor"+dbSchema.id;
	let schemaDefJson = mongooseJsonFromTemplate(dbSchema.dbTemplate);
	let newDB = mongoose.model(modelName, schemaDefJson);

	KESKEN
	tietokantaan ei mene templaten mukaset kentät lainkaan
	
	rowContents = epdbSetSystemFields(rowSpecs, ownerId)
	newRow = new newDB(rowContents);

	console.log("createRow template",dbSchema.dbTemplate)
	console.log("createRow contents",rowSpecs)
	console.log("createRow contents",rowContents)

    newRow.save(function(err, res) {
	if (err) throw err;
	//console.log('rivi '+newRow+' lisätty');
	console.log('rivi lisätty kantaan '+modelName);
    });

    // muuten valittaa että on jo
    mongoose.deleteModel(modelName);
    })
}
    

module.exports.createDB = function(ownerId, dbSpecs, sendFun) {

    ifVerbose("createDB enter");
    
   
    // frontend sends a list of user names, we need id's
    let userIdList = [];
    epdbUser.find({ userName : { $in: dbSpecs.dbUserList } }, (err, users) => {
	userIdList = users.map( (user) => {return(user._id)} );

	console.log("userIdList",userIdList)


	// easier to detect a public database if user list is completely empty
	/*
	userIdList.push(mongoose.Types.ObjectId(ownerId));
	userIdList = noDuplicates(userIdList);
	console.log("userIdList nondupl",userIdList)
	*/
	
	
	epdbDatabaseSchema.find({}, (err, dbs) => {

	    console.log("dbs=",dbs)
	    // sanitize dbSpecs.dbName
	    if (!isEmpty(dbs)) {
		let existingNames = dbs.map( (db) => {return(db.dbName)} );
		if (existingNames.includes(dbSpecs.dbName)) {
		    dbSpecs.dbName = dbSpecs.dbName+"*";
		}
	    }
	    

	    
	    let dbSchema = new epdbDatabaseSchema(
		{
		    dbName: dbSpecs.dbName,
		    dbDescription: dbSpecs.dbDescription,
		    allowedUsers: userIdList,
		    dbTemplate: dbSpecs.dbTemplate,
		    _creator: ownerId
		}
	    );
	    dbSchema.save(function(err, schema) {
		if (err) throw err;
		ifVerbose("createDB exit, created db ",schema.dbName);
		sendFun(err, schema)
	    }) // save
	}) // find db


    }) // find user id's

    
}



module.exports.info = function(dbId, sendFun) {

    console.log("pyytää tietokantaa id:llä", dbId);
    //  console.log("sending", { "title": dbTitle, "template": dbTemplate})
    console.log("nodeserveri/dbinfo-get: HUOM lähettää idioottimaisen debug-otsikon, POISTA");

    // nimet pitää olla uniikkeja että käyttäjä voi valita listasta
    console.log("nodeserveri/dbinfo-get: tietokanta tunnistetaan nimellä eikä id:llä, toimii muttei kaunista");



    epdbDatabaseSchema.find({_id: dbId}, (err, dbEntry) => {

	if (dbEntry.length>1) { console.log("BUGI. Kaksi kantaa samalla id:llä."); }
	dbEntry = dbEntry[0];
	
	console.log("id:llä löytyi kanta", dbEntry.dbName);
	//console.log("names=",dbNames)
	//return res.status(200).json({ "dbNames": dbNames});

	//console.log(dbEntry.dbName)
	//console.log(dbEntry.dbTemplate)
	sendFun(dbEntry.dbName, dbEntry.dbTemplate);	
    }) // find

    
    
}
