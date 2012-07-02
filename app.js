var express = require('express')
  , routes = require('./routes');
  
var app = require('express').createServer();
io = require('socket.io').listen(app);

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);    // just a home page to debugs stuff
app.post('/conf',routes.conf);  // the end point where the twilio app posts to for ringing and completed etc
app.get('/conf/:conf_id',routes.show); //the page that displays the actual conference

//socket.io for debug.
io.sockets.on('connection', function (socket) {
  console.log("user connected");
});


app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
