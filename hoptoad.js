const xmpp = require("simple-xmpp");
const colors = require("colors");
const forker = require("child_process");
const fs = require("fs");

class Hoptoad {
	constructor(){
		var args = process.argv.slice(2, process.argv.length);

		this.authorized = {};
		this.cwd = __dirname;

		this.jid = args[0];
		this.jidPassword = args[1];
		this.accessPassword = args[2];

		this.$initClient();
	}

	/**Console logging*/
	$log(){
		var args = Array.prototype.slice.call(arguments, null);
		var type = args.shift();
		var date = (new Date()).toTimeString().split(" ")[0];
		console.log(date.magenta, ">>".magenta, args[0][type]);
	}

	/**Major client initialization*/
	$initClient(){
		try {
			xmpp.connect({
				jid : this.jid,
				password : this.jidPassword
			});

			xmpp.on("online", this.$onOnline.bind(this));
			xmpp.on("chat", this.$onChat.bind(this));
			xmpp.on("close", this.$onClose.bind(this));
			xmpp.on("error", this.$onError.bind(this));

			if (process.platform === "win32") {
			  	var rl = require("readline").createInterface({
			  	  	input: process.stdin,
			  	  	output: process.stdout
			  	});
	
			  	rl.on("SIGINT", function () {
			  	  	process.emit("SIGINT");
			  	});
			}

			process.on("SIGINT", ()=>{
			  	this.$log("red", "Process interruption");
			  	xmpp.disconnect();
			  	process.exit();
			});

		} catch(err){
			this.$log("red", "Failed to establish connection");
		}

	}

	/**Callbacks*/
	$onOnline(info){
		this.$log("green", "Connected and online");
		xmpp.setPresence("chat", "Hoptoad started at " + (new Date()).toTimeString().split(" ")[0]);
	}

	$onClose(info){
		this.$log("red", "Connected has been terminated");
	}

	$onChat(sender, message){
		this.$log("yellow", "Recieved message from \"" + sender + "\": " + message);
		this.$processMessage(sender, message);
	}

	$onError(message){
		console.log(arguments);
	}		

	/**Messages processing*/
	$processMessage(sender, message){
		this.$processRequest({
			sender : sender,
			args : message.split(" ")
		});
	}

	$sendMessage(target, theme, message){
		message = theme + ": " + message;
		this.$log("green", "Sending message to \"" + target + "\": " + message);
		xmpp.send(target, message);
	}

	$processRequest(request){
		if (!this.authorized[request.sender]){
			this.$log("red", "Attempt to get access from unauthorized account: " + request.sender);

			if (this.accessPassword == request.args[0]){
				this.authorized[request.sender] = true;
				this.$log("green", "Authorized: " + request.sender);
				this.$sendMessage(request.sender, "Hoptoad", "Authorized successfully.");
			} else {
				this.$log("red", "Auth failed: " + request.sender);
				this.$sendMessage(request.sender, "Hoptoad", "Auth failed, wrong password.");
			}
			
		} else {
			this.$execRequest(request);
		}
	}

	$execRequest(request){
		var command = request.args.join(" ");

		forker.exec(command, {
			
		}, (err, out)=>{
			if (err){
				this.$log("red", "Command error: " + err);
				this.$sendMessage(request.sender, "Terminal", err);
			} else {
				this.$log("green", "Command out: " + out);
				this.$sendMessage(request.sender, "Terminal", out);
			}
		});
	}
}

new Hoptoad();