// ---- twitter API ----
/*
 * originated at 
 * http://code.google.com/p/twigadge/source/browse/trunk/js/twigadge.js
 * 
 * MIT Licence.
 * 
 */
/**
 * Create new twitter API object
 * 
 * @param[in] (string)at - access token
 * @param[in] (string)ats - access token secret
 */

var TwitterAPI = (function() {

	var TwitterAPI = function(at, ats) {
		this.consumer = {
			consumerKey : '8lQxrxGJX35qNfosCsNiuw',
			consumerSecret : 'PbmarD6aXoxV4Xo7zVmqyMkZsyNPdPoxOtTp8YKg0'
		};
		this.token = '';
		this.token_secret = '';
		this.atoken = at;
		this.atoken_secret = ats;
	};

	/**
	 * Post API
	 */
	TwitterAPI.prototype.post = function(api, content) {
		var accessor = {
			consumerSecret : this.consumer.consumerSecret,
			tokenSecret : this.atoken_secret
		};

		var message = {
			method : "POST",
			action : api,
			parameters : {
				oauth_signature_method : "HMAC-SHA1",
				oauth_consumer_key : this.consumer.consumerKey,
				oauth_token : this.atoken
			}
		};
		for ( var key in content) {
			message.parameters[key] = content[key];
		}
		OAuth.setTimestampAndNonce(message);
		OAuth.SignatureMethod.sign(message, accessor);
		var target = OAuth.addToURL(message.action, message.parameters);
		var options = {
			type : message.method,
			url : target,
			dataType : 'json',
			timeout : 1000 * 50,
		};
		return $.ajax(options).promise();

	};

	/**
	 * Get API
	 */
	TwitterAPI.prototype.get = function(api) {
		var accessor = {
			consumerSecret : this.consumer.consumerSecret,
			tokenSecret : this.atoken_secret
		};

		var message = {
			method : "GET",
			action : api,
			parameters : {
				oauth_signature_method : "HMAC-SHA1",
				oauth_consumer_key : this.consumer.consumerKey,
				oauth_token : this.atoken
			}
		};
		OAuth.setTimestampAndNonce(message);
		OAuth.SignatureMethod.sign(message, accessor);
		var target = OAuth.addToURL(message.action, message.parameters);
		var options = {
			type : message.method,
			url : target,
			dataType : 'json',
			timeout : 1000 * 50,
		};
		return $.ajax(options).promise();
	};

	/**
	 * get request token from twitter
	 * 
	 * @param[in] (string)errorMsg - error message if the request is retry.
	 */
	TwitterAPI.prototype.getRequestToken = function(errorMsg) {
		return $.Deferred(function(_d) {

			var accessor = {
				consumerSecret : this.consumer.consumerSecret,
				tokenSecret : ''
			};

			var message = {
				method : "GET",
				action : "https://api.twitter.com/oauth/request_token",
				parameters : {
					oauth_signature_method : "HMAC-SHA1",
					oauth_consumer_key : this.consumer.consumerKey
				}
			};
			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);
			var target = OAuth.addToURL(message.action, message.parameters);
			var options = {
				type : message.method,
				url : target,
				success : function(d, dt) {
					d.search(/oauth_token=([\w-]+)\&/);
					twitterapi.token = RegExp.$1;
					d.search(/oauth_token_secret=([\w-]+)\&/);
					twitterapi.token_secret = RegExp.$1;
					_d.resolve(twitterapi);
				},
				error : function() {
					_d.reject.apply(_d, arguments);
				},
				timeout : 1000 * 50
			};
			$.ajax(options);

		}).promise();
	};

	TwitterAPI.prototype.getAccessToken = function(pin) {
		return $.Deferred(function(_d) {

			var accessor = {
				consumerSecret : this.consumer.consumerSecret,
				tokenSecret : this.token_secret
			};

			var message = {
				method : "GET",
				action : "https://api.twitter.com/oauth/access_token",
				parameters : {
					oauth_signature_method : "HMAC-SHA1",
					oauth_consumer_key : this.consumer.consumerKey,
					oauth_token : this.token,
					oauth_verifier : pin
				}
			};
			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);
			var target = OAuth.addToURL(message.action, message.parameters);
			var options = {
				type : message.method,
				url : target,
				success : function(d, dt) {
					d.search(/oauth_token=([\w-]+)\&/);
					twitterapi.atoken = RegExp.$1;
					d.search(/oauth_token_secret=([\w-]+)\&/);
					twitterapi.atoken_secret = RegExp.$1;
					d.search(/screen_name=([\w-]+)/);
					_d.resolve(twitterapi);
				},
				error : function() {
					_d.reject('wrong pin');
				},
				timeout : 1000 * 50
			};
			$.ajax(options);
		}).promise();
	};

	var twitterapi;

	return TwitterAPI;
})();
