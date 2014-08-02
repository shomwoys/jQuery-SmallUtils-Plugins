/**
 * usage:
 * 
 * $(function(){
 * 
 * $.FB.load({init options}, locale).then( $.FB. );
 */

(function($) {

	function fql_query_build(query, param_array) {
		var ret = [], bits = query.split('?');
		while (bit = bits.shift()) {
			ret.push(bit);
			var param = param_array.shift();
			if (param) {
				if (typeof param == 'string') {
					if (param.match(/^(me|now|strlen|substr|strpos)\(.*\)$/)) {
						ret.push(param);
					} else {
						ret.push('"' + param.replace(/"/g, '\"') + '"');
					}
				} else {
					ret.push(param);
				}
			}
		}
		return ret.join('');
	}
	;

	$.extend({
		FB : {

			load : function(locale, func) {
				if ($('#fb-root')[0]) {
					return;
				}
				if (func === undefined) {
					func = locale;
					locale = 'en_US';
				}
				//$('body').append($('<div id="fb-root"></div>'));
				window.fbAsyncInit = func;
				$('body').append($('<div id="fb-root"><script src="//connect.facebook.net/' + locale + '/all.js"></script></div>"'));
				$.FB._locale = locale;
			},

			api : function() {
				var _d = new $.Deferred();
				var args = Array.prototype.slice.call(arguments);
				var has_function = false;
				var has_data = false;
				for ( var i = 0, l = args.length; i < l; i++) {
					if ($.isFunction(args[i])) {
						args[i] = (function(func) {
							return function() {
								var ret = func.call(thisObj, arguments);
								if (ret.error) {
									ret.args = args;
									_d.reject(ret);
								} else {
									_d.resolve(ret);
								}
							};
						})(args[i]);
						has_function = true;
					} else if (typeof (args[i]) != 'string') {
						args[i] = $.extend({
							locale : $.FB._locale
						}, args[i]);
						has_data = true;
					}
				}
				if (!has_data) {
					args.push({
						locale : $.FB._locale
					});
				}
				if (!has_function) {
					args.push(function(ret) {
						//try {
						if (ret.error) {
							ret.args = args;
							_d.reject(ret);
						} else {
							_d.resolve(ret);
						}
						//} catch (ex) {
						//	_d.reject({
						//		exception : ex
						//	});
						//}
					});
				}
				FB.api.apply(FB, args);
				return _d.promise();
			},

			fql : function(query /* [,func] */) {
				/*
				 * ex)
				 * $.FB.fql('select xxx from xxx where xxx').then(func).fail(func);
				 * $.FB.fql(['select xxx from xxx where xxx=?', [12345]]).then(....
				 */
				var args = Array.prototype.slice.call(arguments);
				if ($.isArray(query)) {
					query = fql_query_build.apply(query);
				}
				args[1] = {
					method : 'fql.query',
					query : query
				};
				return $.FB.api.apply($.FB, args);
			},

			fql_multi : function(queries /* [,func] */) {
				/*
				 * ex)
				 * $.FB.fql_multi({
				 *     query1:['select xxx from xxx where xxx=?', [1]],
				 *     query2:['select xxx ..', ['me()']]
				 * }).then(function(res){
				 *          :
				 * })
				 */
				var args = Array.prototype.slice.call(arguments);
				for ( var k in queries) {
					if ($.isArray(queries[k])) {
						queries[k] = fql_query_build.apply(queries[k]);
					}
				}
				args[1] = {
					method : 'fql.mutiquery',
					queries : queries
				};
				return $.FB.api.apply($.FB, args);
			}

		}
	});
})(jQuery);