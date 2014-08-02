/**
 * parse URI and modify.
 * 
 * $.parseUri() = new $.Uri().parsed
 * $.parseUri(uri) = new $.Uri(uri).parsed
 * new $.Uri();
 * new $.Uri(uri);
 * $(elem).getUri() - for element attribute src,href,action
 * 
 * return $.Uri() object:
 * <pre>
 * uri = $.parseUri();
 * uri.original -> original uri
 * uri.parsed -> {
 *	 // window.location like attrs
 *   protocol : "<http:|https:|...>" or undefined,
 *   hostname : "some.host.name" or undefined,
 *   port : <port> or undefined,
 *   pathname : "/some/base/dir/file" or undefined,
 *   search : "?q=v" or undefined,
 *   hash : "#somehash" or undefined,
 *   
 *   // some additional attrs
 *   base : "http://user@pass:some.host.name:port",
 *   user : "<user>" or undefined,
 *   pass : "<password>" or undefined,
 *   dirname : "/some/base/dir/" or undefined,
 *   file : "file" or undefined,
 *   params : {
 *       'key':'decoded value',
 *       'key':['decoded value1', 'decoded value2'],
 *       'key_without_value':true
 *   }
 * }
 * 
 * $.Uri() object has methods below:
 * 
 * uri.parse(uri) -> new parsed Uri()
 * uri.href() -> full href string
 * uri.set('<attr>', '<value>') : set attr
 *    ex) uri.set('protocol', 'https')
 * uri.set('params', 'key', 'value') : set params value
 * 
 * </pre>
 * 
 * parse location.href
 * 
 */

;
(function($) {

	var parseUriRx = new RegExp(
			'^(([^/]+:)?//(?:([^:@]+)(?::([^@]*))?@)?(([^/:\\?\\#]+)(?::(\\d+))?))?((/?(?:(?:[^/\\?#]+/)*))?(?:([^/\\?#]+))?)?(\\?[^#]*)?(#.*)?$');

	function Uri(uri) {
		this.parse(uri);
	}
	
	var _current_href = location.href;

	function parseSearch(search) {
		var params = {};
		$.each(search.substring(1).split('&'), function() {
			var b = this.split('=');
			if (b.length === 1) {
				params[b[0]] = true;
			} else {
				var k = b[0], v = decodeURIComponent(b[1]);
				if (b[0] in params) {
					if ($.isArray(params[k])) {
						params[k].push(v);
					} else {
						params[k] = [ params[k], v ];
					}
				} else {
					params[k] = v;
				}
			}
		});
		return params;
	}

	function buildSearch(params) {
		var search = [];
		$.each(params, function(k, v) {
			if (v === true) {
				search.push(k);
			} else if (v === undefined) {
				// ignore
			} else {
				if (!$.isArray(v)) {
					v = [ v ];
				}
				$.each(v, function() {
					search.push(encodeURIComponent(k) + '=' + encodeURIComponent(this));
				});
			}
		});
		if (search.length > 0) {
			return '?' + search.join('&');
		} else {
			return undefined;
		}
	}

	function _u(v, r) {
		return ((v === undefined || v === '') ? '' : ((r === undefined || r === '') ? v : r));
	}
	
	var _hashDecode = function(v) { return v; };
	var _hashEncode = function(v) { return v; };
	if ($.browser.mozilla) {
		_hashDecode = function(v) {
			if (v === undefined) { return v; }
			return '#' + decodeURIComponent(v.substring(1)); 
		};
		_hashEncode = function(v) {
			if (v === undefined) { return v; }
			return '#' + encodeURIComponent(v.substring(1)); 
		};
	}
	
	var _current_href = null;
	var _current_uri = null;

	Uri.prototype = {

		parse : function(uri, href_base) {
			this.original = uri;
			
			uri = (uri === undefined) ? location.href : uri;
			var m = parseUriRx.exec(uri);
			if (!m) {
				return null;
			}
			this.parsed = {

				protocol : m[2] || undefined,
				host : m[5] || undefined,
				hostname : m[6] || undefined,
				port : m[7] ? parseInt(m[7], 10) : undefined,
				pathname : m[8] || undefined,
				search : m[11] || undefined,
				hash : _hashDecode(m[12]) || undefined,

				base : m[1] || undefined,
				dirname : m[9] || undefined,
				file : m[10] || undefined,

				user : m[3] || undefined,
				pass : m[4] || undefined

			};
			if (this.parsed.protocol === undefined) {
				this.parsed.protocol = location.protocol;
			}
			if (this.parsed.base === undefined) {
				// relative
				var p = this.parsed;
				if (href_base === undefined) {
					if (_current_href != location.href) {
						_current_href = location.href;
						_current_uri = new Uri().parsed;
					}
					href_base = _current_uri;
				} else {
					href_base = new Uri(href_base).parsed;
				}
				var loc = $.extend({}, href_base);
				loc.search = undefined;
				loc.hash = undefined;
				loc.params = {};

				if (p.pathname !== undefined && p.pathname[0] !== '/') {
					p.pathname = loc.dirname + p.pathname;
					p.dirname = loc.dirname + (p.dirname === undefined ? '' : p.dirname);

					p.pathname = p.pathname.replace(/\/[^\/]+\/\.\.\//g, '/');
					p.dirname = p.dirname.replace(/\/[^\/]+\/\.\.\//g, '/');
				}
				
				this.parsed = $.extend(loc, p);
				
				this.parsed.base = this.base();
			}

			var params = {};
			if (this.parsed.search) {
				params = parseSearch(this.parsed.search);
			}
			this.parsed.params = params;
			return this;
		},

		set : function(attr, v, pv) {
			var _self = this;
			if (typeof attr === 'object') {
				$.each(attr, function(k, v){
					_self.set(k, v);
				});
				return _self;
			}
			switch (attr) {
			case 'protocol':
			case 'user':
			case 'pass':
			case 'hostname':
			case 'port':
			case 'dirname':
			case 'file':
				this.parsed[attr] = v;
				break;
			case 'hash':
				this.parsed.hash = _hashDecode(v);
				break;
			case 'params':
				if (typeof v === 'object') {
					this.parsed.params = v;
				} else {
					this.parsed.params[v] = pv;
				}
				this.parsed.search = buildSearch(this.parsed.params);
				break;
			case 'host':
				this.parsed.host = v.split(':')[0];
				this.parsed.port = v.split(':')[1];
				break;
			case 'pathname':
				var m = new RegExp('(/(?:(?:[^/\\?#]+/)*))?(?:([^/\\?#]+))?').exec(v);
				this.parsed.dirname = m[1];
				this.parsed.file = m[2];
				break;
			case 'search':
				this.parsed.params = parseSearch(v);
				this.parsed.search = v;
				break;
			default:
				throw new Error('Uri().set() : invalid attr : ' + attr);
			}
			this.parsed = this.parse(this.href()).parsed;
			return _self;
		},

		base : function(){
			var p = this.parsed;
			return p.protocol + '//' + _u(p.user, p.user + _u(p.pass, ':' + p.pass) + '@') + p.hostname + _u(p.port, ':' + p.port);
		},
		
		absolutePath : function(){
			var p = this.parsed;
			return _u(p.dirname) + _u(p.file)
			+ _u(p.search) + _u(p.hash, _hashEncode(p.hash));
		},
		
		href : function() {
			return this.base() + this.absolutePath();
		}
		

	};

	$.extend({
		Uri : function(uri){
			return new Uri(uri);
		},
		parseUri : function(uri, href_base) {
			// return new Uri(uri).parsed;
			return new Uri().parse(uri, href_base).parsed;
		}
	});

	$.fn.extend({
		getUri : function() {
			var $elem = $(this[0]);
			var href = $elem.attr('href') || $elem.attr('src') || $elem.attr('action');
			if (href) {
				return new Uri(href);
			}
			return undefined;
		},
		
		setUri : function(uri, pathonly){
			$.each(this, function(){
				$elem = this;
				var attr = {
					'A' : 'href',
					'LINK' : 'href',
					'BASE' : 'href',
					'SCRIPT' : 'src',
					'IMG' : 'src',
					'IFRAME' : 'src',
					'FORM' : 'action'
				}[$elem[0].nodeName];
				$elem.attr(attr, pathonly ? uri.absolutePath() : uri.href());
			});
			return this;
		}
	});

})(jQuery);