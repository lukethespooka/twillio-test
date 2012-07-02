var conference = require('../lib/conference');
var _ = require("underscore");

var conferenceManager = conference.conferenceManager;

exports.index = function(req, res){

	// test twiml
	var xml = '<?xml version="1.0" encoding="UTF-8" ?>' +
              '<Response>' +
              '<Say voice="woman" language="en-gb" loop="2">Hello you have got thru to me</Say>' +
              '</Response>';

    res.writeHead(200, { 'Content-Type': 'application/xml' });
	
    res.write(xml) ;
    res.end();
  
 

};

exports.conf = function(req, res){

  console.log(req.body.CallStatus);
  conferenceManager.emit(req.body.CallStatus, req,res);


};


// show the show.ejs view with the conference and participants
exports.show = function(req, res){

  console.log("show .... " + req.params.conf_id);

  var c = conference.conferences[req.params.conf_id];
 
  if(_.isUndefined(c)) {
    c = new conference.Conference(req.params.conf_id) ;
  } 
	
  res.render('show', { conf: c })
  
   
  
};