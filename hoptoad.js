const xmpp = require("simple-xmpp");
const colors = require("colors");
const exec = require('child_process').exec;

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
		} catch(err){
			this.$log("red", "Failed to establish connection");
		}

	}

	/**Callbacks*/
	$onOnline(info){
		this.$log("green", "Connected and online");
	}

	$onClose(info){
		this.$log("red", "Connected has been terminated");
	}

	$onChat(sender, message){
		this.$log("yellow", "Recieved message from \"" + sender + "\": " + message);
		this.$processMessage(sender, message);
	}	

	/**Messages processing*/
	$processMessage(sender, message){
		var request = this.$parseRequest(sender, message);
		this.$invokeRequest(request);
	}

	$sendMessage(target, theme, message){
		message = theme + ": " + message;
		this.$log("green", "Sending message to \"" + target + "\": " + message);
		xmpp.send(target, message);
	}

	$parseRequest(sender, message){
		message = message.charAt(0).toLowerCase() + message.substr(1);
		var splitted = message.split(" ");
		var program = splitted.shift();
		var command = splitted.shift();
		var args = splitted;

		return {
			sender : sender,
			program : program,
			command : command,
			args : args
		};
	}

	$invokeRequest(request){
		if (!this.authorized[request.sender] && request.program != "hoptoad" && request.command != "auth"){
			this.$log("red", "Attempt to get access from unathorized account: " + request.sender);
			this.$sendMessage(request.sender, "hoptoad", "You need to authorize first, use \"hoptoad auth password\"");
		} else if (!this.authorized[request.sender] && request.program == "hoptoad" && request.command == "auth"){
			if (request.args[0] == this.accessPassword){
				this.authorized[request.sender] = true;
				this.$log("green", "authorized successfully: " + request.sender);
				this.$sendMessage(request.sender, "hoptoad", "authorized successfully");
			} else {
				this.$log("red", "auth failed, wrong password: " + request.sender);
				this.$sendMessage(request.sender, "hoptoad", "auth failed, wrong password");
			}
		} else if (this.authorized[request.sender]){
			this.$invokeAuthorizedRequest(request);
		}
	}

	$invokeAuthorizedRequest(request){
		switch (request.program){
			case "term":
				let termArgs = request.args.slice();
				termArgs.unshift(request.command);
				this.$log("yellow", "Start invoking command \"" + termArgs.join(" ") + "\"");
				exec(termArgs.join(" "), {
					cwd : this.cwd
				}, (err, stdout, stderr)=>{
					this.$sendMessage(request.sender, stdout);
					console.log(err, stdout, stderr);
				});
			break;
		}
		console.log(request);
	}
}

new Hoptoad();