var host = process.env.HOST || "http://localhost:8008";
var user = process.env.MATRIX_USER || "test";
var password = process.env.MATRIX_PASSWORD || "password";

var matrix = require("matrix-js-sdk");
var client = matrix.createClient(process.env.HOST || "http://localhost:8008");




var poll = function(lastMsg){
  client.eventStream(lastMsg, 600000, function(err, res){
    handleMessages(res.chunk);
    lastMsg = res.end;
    poll(lastMsg);
  })
}

var startPolling = function(){
  client.initialSync(8, function(err,msgs){
    poll(msgs.end)
  })
}

var handleMessages = function(msgs){
  var msg;
  for( var i =0;i< msgs.length;i++){
    msg = msgs[i];
    if(msg.content && msg.content.msgtype === "m.text"){
      try {
        var msgObj = JSON.parse(msg.content.body);
        console.log("Command: " + msgObj.command + " Direction: " + msgObj.direction || "not provided");
      }catch(e)
      {
        //ignore it
      }
    }
  }
}

client.login("m.login.password", {"user":user, "password":password}, function(err,res){
  if(err){
    console.log("Couldn't login to matrix: " + err.message);
  }else {
    client.credentials.accessToken = res.access_token;
    client.credentials.userId = res.user_id;
    console.log("matrix listener initialized")

  }
  startPolling();
})
