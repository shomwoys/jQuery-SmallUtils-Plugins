(function($) {
	
	function Twitter() {
		this.ratelimit = {};
	}
	
	Twitter.prototype.checkLogin = function() {
		return $.Deferred(function(_d) {
			$.ajax({
				cache:false,
				url : 'twitter-oauth.php',
				type : 'POST',
				dataType : 'json'
			}).then(function(res) {
				if (res.error) {
					_d.reject(res);
				} else {
					_d.resolve(res);
				}
			}).fail(function(res) {
				_d.reject(res);
			});
		}).promise();
	};
	
	Twitter.prototype.logout = function() {
		return $.Deferred(function(_d) {
			$.when($.ajax({
				cache:false,
				url : 'twitter-oauth.php',
				type : 'POST',
				dataType : 'json',
				data : {
					wipe : '1'
				}
			}), $.ajax({
				url : 'twitter-rest.php',
				type : 'POST',
				dataType : 'json'
			})).then(function(res) {
				if (res.error) {
					_d.reject(res);
				} else {
					_d.resolve(res);
				}
			}).fail(function(res) {
				_d.reject(res);
			});
		}).promise();
	};
	
	Twitter.prototype.authenticate = function() {
		// login and auth
		return $.Deferred(function(_d) {
			$.ajax({
				cache:false,
				url : 'twitter-oauth.php',
				type : 'POST',
				dataType : 'json',
				data : {
					authenticate : '1'
				}
			}).then(function(res) {
				if (res.error) {
					_d.reject(res);
				} else {
					if (res.auth_url) {
						window.open(res.auth_url);
					} else {
						// logined
						// res = user
					}
					_d.resolve(res);
				}
			}).fail(function(res) {
				_d.reject(res);
			});
		}).promise();
	};
	
	Twitter.prototype.authorize = function() {
		// permission
		return $.Deferred(function(_d) {
			$.ajax({
				cache:false,
				url : 'twitter-oauth.php',
				type : 'POST',
				dataType : 'json',
				data : {
					authorize : '1'
				}
			}).then(function(res) {
				if (res.error) {
					_d.reject(res);
				} else {
					if (res.auth_url) {
						window.open(res.auth_url);
					} else {
						// logined
						// var user = res;
					}
					_d.resolve(res);
				}
			}).fail(function(res) {
				_d.reject(res);
			});
		}).promise();
	};
	
	Twitter.prototype.getLoginUser = function() {
		/**
		 * get logined and authorized user.
		 * 
		 * @return user object or null
		 */
		var self = this;
		return $.Deferred(function(_d) {
			self.rest('GET', '1/account/verify_credentials', {
				skip_status : 1
			}).then(function(res) {
				_d.resolve({
					user : res
				});
			}).fail(function(res) {
				_d.reject(res);
			});
		}).promise();
	};
	
	/*
	Twitter.protype.apply_entities = function(text, entities){
		if (entities){
			if (entities.user_mentions){
				
			}
			if (entities.urls){
				
			}
			if (entities.hashtags){
				
			}
		}
	};*/

	Twitter.prototype.search = function(query, params) {
		var self = this;
		return $.Deferred(function(_d) {
			params.q = query;
			self.rest('GET', 'search', params).then(function(res) {
				_d.resolve(res);
				_d.resolve($.map(res.results, function(v, i) {
					return v;
				}));
			}).fail(function(res) {
				_d.reject(res);
			});
		}).promise();
	};
	
	Twitter.prototype.rest = function(method, path, params) {
		var data = $.extend({
			_p : path,
		}, params);
		return $.Deferred(function(_d) {
			$.ajax({
				cache:false,
				url : 'twitter-rest.php',
				// url : 'https://api.twitter.com/'+path+'.json?callback=?',
				//cache : true,
				type : method,
				dataType : 'json',
				data : data,
			}).then(function(res, stat, xhr) {
				if (res.error) {
					_d.reject(res);
				} else {
					// $('#tw_ratelimit').data('DataTmpl').update(res.ratelimit);
					var headers = {};
					$.map(['reset','limit','remaining'], function(v, i){
						headers['x_ratelimit_'+v] = xhr.getResponseHeader('x_ratelimit_'+v) || null;
					});
					var reset_time = headers['x_ratelimit_reset'] || null;
					var ratelimit = {
						'hourly_limit' : headers['x_ratelimit_limit'] || null,
						'remaining_hits' : headers['x_ratelimit_remaining'] || null,
						'reset_time_in_seconds' : reset_time || null,
						'reset_time' : (new Date(reset_time * 1000)) || null
					};
					this.rate_limit = ratelimit;
					// _d.resolve(res.response, res.ratelimit);
					_d.resolve(res, ratelimit);
				}
			}).fail(function(res) {
				_d.reject(res);
			});
		}).promise();
	};
	
	Twitter.prototype.rate_limit = function() {
		return this.res('GET', '1/account/rate_limit_status');
	};
	
	$.extend({
		Twitter : Twitter
	});
})(jQuery);