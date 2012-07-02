/************
* Conference module to process all the stuff that happens when events fire from a conference
* basically an event emitter with listeners for the call and hangup events
*/

var events = require('events');
var _ = require("underscore");
var io = require('socket.io');


var eventEmitter = new events.EventEmitter();


// a map of all the conferences
var conferences = {};


//a participant object to store msisdn and status (offline/online)
function Participant(msisdn,status) {
    this.msisdn = msisdn ;
    this.status = status;
}

//a conference object to store the conf number and a list of participants who have calld
function Conference(conf_msisdn){
	console.log("Creating " + conf_msisdn);
	this.msisdn = conf_msisdn ;
	this.participants = {};
}

//add a participant to a conference
Conference.prototype.add = function(participant) {

	console.log("Adding " + participant.msisdn + " to " + this.msisdn );

	this.participants[participant.msisdn] = participant;

};


//utility function to trim the "+" from the front of a msisdn
function removePlus(msisdn) {
	return msisdn.substr(1);
}


//when someon hangs up makr them as offline in the conference
eventEmitter.on('completed', function(req, res){
    console.log("Completed ****************************************************************");

	var to =  removePlus(req.body.To);
    var from = removePlus(req.body.From);

	console.log("Completed " + from);

   	var conf = conferences[to];

	if(!_.isUndefined(conf)) {
		
		var participant = conf.participants[from] ;
		
		if(!_.isUndefined(participant)) {
			participant.status = "offline";
		}
		
	}
  
	
});

// when some on rings add them to the conference - create the conference too if it aint there
eventEmitter.on('ringing', function(req, res){
   
	 console.log("ringing ********************************************" + req.body.To);

	 var to =  removePlus(req.body.To);
     var from = removePlus(req.body.From);

	 var conf = conferences[to];

	 if(_.isUndefined(conf)) {
		  console.log("no there" + to)
		  conf = new Conference(to);
		  conferences[conf.msisdn] = conf
	  } else {
		  console.log("its there " + to)
	  }
	
	  conf.add(new Participant(from,"online"));


	  var xml = '<?xml version="1.0" encoding="UTF-8" ?>' +
	                      '<Response>' +
	                      '<Dial><Conference>Brijtalk Conf</Conference></Dial>'+
	                      '</Response>';

	  res.writeHead(200, { 'Content-Type': 'application/xml' });

	  res.write(xml) ;
	  res.end();


});

//broadcast to all web clients eho are listening to this cong that the msisdn has joined.
eventEmitter.on('ringing', function(req, res){

   
   
   var to =  removePlus(req.body.To);
   var from = removePlus(req.body.From);

    console.log("Broadcast ringing: " + from);
	
	global.io.sockets.emit(to, { from: from, status:"online" });


});

//broadcast to all web clients eho are listening to this cong that the msisdn has left.
eventEmitter.on('completed', function(req, res){
   
   var to =  removePlus(req.body.To);
   var from = removePlus(req.body.From);

   console.log("Broadcast completed: " + from);
 
   global.io.sockets.emit(to, { from: from, status:"offline"});


});


//export the variables so we can use them in other modules
exports.conferenceManager = eventEmitter;
exports.conferences = conferences;
exports.Conference = Conference;