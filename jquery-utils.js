/*
 * jQury Utils plugin
 * 
 * The MIT License
 * 
 * Copyright (c) 2012- Shoji Matsumoto (shomwoys@gmail.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 *********************************************************************
 * 
 * This is a jQuery plugin includes some useful small functions.
 * 
 * $.typeOf() : better 'typeof'
 *   -> 'null','undefined','boolean','string','number','function','date','regexp','object'
 * 
 * var bound_func = $.closure([arg1,arg2,...],thisObj,function(_binded_arg1,_binded_arg2,..., arg1,arg2){});
 * bound_func(arg2, arg2);
 * 
 * $.doLater(function(){...},delay).then(function(){success}).fail(function(ex){...};
 * $.doLaterWith([arg1,arg2,...],thisObj,function(_arg1,_arg2,...){...},delay).then(function(){success}).fail(function(ex){...};
 * 
 * $.resolve({a:{b:"resolved a.b value"}},"a.b")
 *   -> "resolved a.b
 * var obj = {a:{b:"value"}};
 * $.resolve(obj, "b", "modified value for a.b");
 * 
 * $.parseISO8601('1970-01-01T00:00:00Z')
 *   -> Date(0)
 * 
 * $.dateformat(new Date(0), 'yyyy/MM/dd HH:mm')
 *   -> "1970/01/01 00:00"
 * 
 * $.numformat.comma3(1234.5678) -> '1,234.567'
 * 
 * $.numformat.round(12345, 3) -> 12300
 * $.numformat.round(12345.678, -1, true) -> 12345.600
 * 
 * $.numformat.kilo(1024) -> 1
 * $.numformat.mega(1024*1024) -> 1
 * 
 * $.encodeHtml('test<a>test') -> 'test&lt;a&gt;test'
 * $.decodeHtml('text&amp;text') -> 'text&text'
 * 
 * $.relativeTime(new Date()) -> 'Now', 'xxx min later', ...
 * 
 * $.calcAge('2000-01-01') -> 12 (age for person birthed at '1950-01-01' as int)
 * 
 */

(function($) {

	var _div = $("<div>");
	var loremIpsum_src = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In dignissim sem et arcu imperdiet molestie. Curabitur non libero at diam eleifend molestie id ac justo. Sed viverra, est ut mattis faucibus, lacus diam cursus mauris, eu laoreet nibh augue nec ante. Vestibulum id elit sit amet velit pulvinar fermentum et egestas libero. Nullam hendrerit nunc non orci convallis at sodales sem pellentesque. Integer imperdiet porttitor faucibus. Etiam placerat ultrices venenatis. Nam lectus est, posuere at interdum non, ullamcorper sit amet augue. Integer tristique tellus ut eros fermentum molestie sollicitudin tortor molestie. Nam facilisis auctor mattis. Sed et lectus leo. Aliquam erat volutpat. In iaculis vehicula arcu, scelerisque sodales turpis vehicula vel. Quisque eleifend porttitor dolor ac fermentum. Suspendisse nec lectus vel elit euismod vestibulum. "
			.split(' ');
	var scrollbarWidth = null;
	
	/**
	 * extend $.brwoser for iOS, Android and add css to <body>.
	 * $.browser.{iphone,ipod,ipad} = true|false
	 *   $.browser.ios.version = iOS version (ex: 5.1.1)
	 * $.browser.android
	 *   $.browser.android.version = Android version (ex:2.3.4)
	 *   $.browser.android.{mobile,tablet}
	 * 
	 * append class to <body>:
	 *   ua-{webkit,safari,msie,mozilla,opera,ios,android},
	 *   ua-{webkit,safari,msie,mozilla,opera,ios,android}-<version>,		ex) ua-ios-5.1.1
	 *   ua-{webkit,safari,msie,mozilla,opera,ios,android}-<version|x.x>,	ex) ua-ios-5.1
	 *   ua-{webkit,safari,msie,mozilla,opera,ios,android}-<version|x>		ex) ua-ios-5
	 */
	var _ua = navigator.userAgent, m, k, i;
	
	// $.browser = $.browser || {};
	$.browser = { useragent: _ua };
	
	// http://www.useragentstring.com/
	var rxs = [
		// key, regexp(ver), ismobile, break 
		['webkit', /AppleWebKit\/([0-9.]+)/, false, false]
		,['ios', /iPhone OS ([\d_]+)/, true, false]
		,['ios', /iPad;(?: U;)? CPU OS ([\d_]+)/, true, false]
		,['macosx', /Mac OS X ([\d_]+)/, false, false]
		,['operamini', /Opera Mini\/([0-9.]+)$/, true, false]
		,['operamobi', /Opera Mobi\/([^ ;]+)$/, true, false]
		,['opera', /^Opera\/.*Version\/([0-9.]+)$/, false, true]
		,['opera', /^Opera ([0-9.]+)/, false, true]
		,['opera', /Opera[\/ ]([0-9.]+)/, false, true]
		,['chrome', /CriOS\/([0-9.]+)/, true, true]
		,['chrome', /Chrome\/([0-9.]+)/, false, true]
		,['firefox', /Fennec\/([0-9.]+)/, true, true]
		,['firefox', /Firefox\/([0-9.]+)/, false, true]
		,['safari', /Version\/([0-9.]+) Safari\/([0-9.]+)/, false, true]
		,['safari', /Safari\/([0-9.]+)/, false, true]
		,['msie', /IEMobile\/([0-9.]+)/, true, true]
		,['msie', /MSIE ([0-9.]+)/, false, true]
	];
	$.each(rxs, function(i, v){
		var k = v[0];
		var m = _ua.match(v[1]);
		if (m) {
			$.browser[k] = {
				version: m[1].replace(/_/g, '.'),
				mobile: v[2]
			};
			$.browser.version = $.browser[k].version;
			$.browser.mobile = v[2];
			if (v[3]) {
				return false;
			}
		}
	});
	
	if ($.browser.opera) {
		m = _ua.match(/Opera Mini\/([0-9.]+)/);
		if (m) {
			$.browser.opera.mini = { version:m[1] };
			$.browser.opera.mobile = true;
		}
	}
	if ($.browser.safari) {
		m = _ua.match(/ Mobile\//);
		if (m) {
			$.browser.safari.mobile = true;
		}
	}
	if ($.browser.msie) {
		$.browser.msie.backcompat = document.compatMode == 'BackCompat';
		// see http://d.hatena.ne.jp/favril/20090424/1240548931
	}
	
	$.browser.mozilla = $.browser.firefox;
	
	if (m = _ua.match(/Android ([0-9.]+)/)) {
		$.browser.android = {
			mobile: !!_ua.match(/Mobile/),
			tablet: !(_ua.match(/Mobile/)),
			version: m[1]
		};
	} else if (m = _ua.match(/Android;/)) {
		$.browser.android = {
			mobile: true,
			firefox: true,
			version:'unknown'
		};
	}

	if ($.browser.ios) {
		$.browser.iphone = !!_ua.match(/iPhone/);
		$.browser.ipod = !!_ua.match(/iPod/);
		$.browser.ipad = !!_ua.match(/iPad/);
		$.browser.ios.mobile = $.browser.iphone || $.browser.ipod;
		$.browser.ios.tablet = $.browser.ipad;
	}

	$.browser.mobile = $.browser.iphone || $.browser.ipod 
		|| ($.browser.android && $.browser.android.mobile)
		|| ($.browser.msie && $.browser.msie.mobile)
		|| ($.browser.firefox && $.browser.firefox.mobile);
	$.browser.tablet = $.browser.ipad || ($.browser.android && $.browser.android.tablet);
	$.browser.desktop = !$.browser.mobile && !$.browser.tablet;
	$.browser.touchable = !!('ontouchstart' in window);
	
	$.each(['msie', 'webkit', 'safari', 'opera', 'mozilla', 'firefox', 'chrome', 'opera'], function(i, v){
		var _b = $.browser[v];
		if (_b){
			$('html').addClass('ua-' + v);
			var _v = (_b.version || $.browser.version).split('.');
			if (_v) {
				$('html')
					.addClass('ua-' + v + '-' + _v.join('.'))
					.addClass('ua-' + v + '-' + _v[0] + '.' + _v[1])
					.addClass('ua-' + v + '-' + _v[0]);
			}
		}
	});
	
	$.each($.browser, function(k, v){
		if (!v) {
			delete $.browser[k];
		}
	});
	
	$.each(['ios', 'android'], function(i, v){
		var _b = $.browser[v];
		if (_b){
			$('html').addClass('ua-' + v);
			var _v = $.browser[v].version.split('.');
			if (_v) {
				$('html')
					.addClass('ua-' + v + '-' + _v.join('.'))
					.addClass('ua-' + v + '-' + _v[0] + '.' + _v[1])
					.addClass('ua-' + v + '-' + _v[0]);
			}
		}
	});
	
	// CSSの小数点丸め
	// http://iwb.jp/decimal-point/ 
	$.browser.cssRound = function(v){
		return Math.round(v);
	};
	if ($.browser.webkit) {
		$.browser.cssRound = function(v) {
			return Math.floor(v + 0.01);
		};
	} else if ($.browser.firefox) {
		$.browser.cssRound = function(v) {
			return Math.floor(v + (1 - 0.49166));
		};
	} else if ($.browser.msie) {
		$.browser.cssRound = function(v) {
			return Math.floor(v);
		};
	}
	
	/*
	$.each(['mobile', 'tablet', 'desktop'], function(i, v){
		$('body').toggleClass('ua-' + v, $.browser[v]);
	});
	*/
	

	if (!('console' in window)) {
		window.console = { log:$.noop, error:$.noop, warn:$.noop, info:$.noop };
	} else if (typeof window.console.log != 'function') {
		// for IE
		var _console = window.console;
		window.console = {};
		$.each(['log', 'error', 'warn', 'info'], function(i, v){
			(function(method){
				var org = _console[method];
				window.console[method] = function(){
					return org(Array.prototype.slice.apply(arguments).join(', '));
				};
			})(v);
		});
	}
	
	$(document).ready(function(){
		var $div = $('#_dpi') || $('<div>').attr('id', '_dpi').css({
			position: 'absolute',
			width: '1in',
			height: '0',
			padding: 0
		}).appendTo('body');
		$.browser.dpi = $div.width();
	});
	
	$(document).ready(function(){
		var dummy_console = $('textarea#console');
		if (dummy_console[0]){
			var dump = function(){
				var args = Array.prototype.slice.apply(arguments);
				return $.map(args, function(v){
					if (v === window) return '[Window]';
					// if (v instanceof jQuery) return '[jQuery:[' + v.map(function(i, v){return dumpHTMLElement(v);}).toArray().join(',') + ']]';
					if ($.isXMLDoc(v)) return '[Node:' + dumpHTMLElement(v) + ']';
					if ($.isPlainObject) return ($.toJSON ? $.toJSON(v) : ''+v );
					return "" + v;
				}).join(',');
			};
			$.each([['log',''], ['error','\nERR: '], ['warn','WARN: '], ['info', 'INFO: ']], function(i, v){
				(function(method){
					var lead = method[1], method = method[0], org = window.console[method];
					window.console[method] = function(){
						var args = Array.prototype.slice.apply(arguments);
						dummy_console.val(dummy_console.val() + lead + dump.apply(this, args) + '\n').scrollTop(100000);
						return org.apply(console, arguments);
					};
				})(v);
			});
			console.log('--- start console ---');
		}
	});
	
	
	$.extend({
		
		_log : function() {
			if ('console' in window) {
				console.log.apply(console, arguments);
			}
		},
		
		_error : function() {
			if ('console' in window) {
				console.error.apply(console, [(new Error()).stack].concat(arguments));
			}
		},

		_typeOf_constructors : {
			array : (new Array()).constructor,
			date : (new Date()).constructor,
			regexp : (new RegExp()).constructor,
			string : (new String()).constructor,
			number : (new Number()).constructor,
			boolean : (new Boolean()).constructor
		},

		typeOf : $.type || function(v) {
			/**
			 * return better 'typeof'
			 */
			if (v === null) {
				return 'null';
			}
			var t = typeof (v);
			if (t === 'object') {
				for ( var k in $._typeOf_constructors) {
					if (v.constructor === $._typeOf_constructors[k]) {
						return k;
					}
				}
				return 'object';
			}
			return t;

		},
		
		isDeferred : function(obj) {
			return obj && $.isFunction(obj.then && obj.fail && obj.always);
		},

		closure : function(args, thisobj, func) {
			/**
			 * make args binded closure for func. 
			 * func is called with arg(args[0], args[1], ... , arguments[0], arguments[1].
			 * ex)
			 *   var f2 = $.closure([1,2], null, function(_a, _b, c) { print _a,_b,c; });
			 *   f2(3); -> 1,2,3
			 * 
			 * @param args
			 *            array of binding arguments
			 * @param thisobj
			 *            binding 'this' object
			 * @param func
			 *            closure function
			 * @return args and 'this' binded function
			 */
			var _args = Array.prototype.slice.call(args);
			return function() {
				return func.apply(thisobj, _args.concat(Array.prototype.slice.apply(arguments)));
			};
		},

		doLaterWith : function(args, thisobj, func, delay) {
			/**
			 * Deferred setTimeout with closure
			 */
			delay = (delay === undefined) ? 0 : delay;
			var c = $.closure(args, thisobj, func);
			return $.Deferred(function(_d) {
				setTimeout(function() {
					try {
						_d.resolve(c());
					} catch (ex) {
						_d.reject(ex);
						throw ex;
					}
				}, delay);
			});
		},

		doLater : function(func, delay) {
			/**
			 * Deferred setTimeout
			 */
			if ($.isFunction(func)) {
				return $.doLaterWith([], null, func, delay);
			} else {
				return $.doLaterWith([], null, function() {
				}, func, 1);
			}
		},
		
		pollWith : function(args, thisobj, func, timeout, interval) {
			/**
			 * while func returns true, func is called repeatedly by interval
			 */
			interval = (interval === undefined) ? 250 : interval;
			timeout = (timeout == undefined) ? -1 : timeout;
			var c = $.closure(args, thisobj, func), remain = timeout * 1000 / interval;
			return $.Deferred($.closure([timeout, remain, interval], null, function(timeout, remain, interval, _d){
				var ret, _t = null;
				if ((ret = c()) !== true) {
					_d.resolve(ret);
				} else {
					_t = setInterval(function(){
						if (timeout > 0 && remain < 0) {
							clearInterval(_t);
							_d.resolve('timeout');
						} else if ((ret = c()) !== true) {
							clearInterval(_t);
							_d.resolve(ret);
						}
						remain--;
					}, interval);
				}
			}));
		},
		
		poll : function(func, timeout, interval) {
			return $.pollWith([], null, func, timeout, interval);
		},

		resolve : function(obj, str, val) {
			/**
			 * resolve object by string. 
			 * ex) 
			 *   $.resolve(obj, 'var'); -> obj.var
			 *   $.resolve(obj, 'arr[10]'); -> obj.arr[10]
			 *   $.resolve(obj, 'func()'); -> obj.func()
			 *   $.resolve(obj, 'var.func()'); -> obj.var.func()
			 *   $.resolve(obj, 'var.arr[1]'); -> obj.var.arr[1]
			 *   $.resolve(obj, 'func()[10]'); -> obj
			 */

			var bits = str.split('.'), bit, settable = false;
			var curobj = obj;
			var curname = '';
			while (bit = bits.shift()) {

				if (curobj === undefined) {
					throw new Error('ResolveError: obj is undefined:<obj>' + curname);
				}

				curname = curname + '.' + bit;
				var res = bit.match(/^([a-zA-Z0-9_]+)(\(\))?(\[(\d+)\])?/);

				var name = res[1];
				var isfunc = res[2] == '()';
				var isarray = (res[3] != undefined) && (res[3] != ''); // ''
				// for
				// IE7
				var arraynum = parseInt(res[4], 10);

				if (isfunc || isarray) {
					if (curobj[name] === undefined) {
						throw new Error('ResolveError: property is undefined:<obj>' + curname);
					}
					if (isfunc) {
						settable = false;
						if (curobj[name].call === undefined) {
							throw new Error('ResolveError:property is not callable:<obj>' + curname);
						}
						curobj = curobj[name].call(curobj);
					} else {
						settable = true;
						if (curobj[name] === undefined) {
							throw new Error('ResolveError:undefined property:<obj>' + curname);
						}
						curobj = curobj[name][arraynum];
					}
				} else {
					settable = true;
					curobj = curobj[name];
				}
			}

			if (val !== undefined) {
				if (settable) {
					eval('(function(obj,v){obj.' + str + ' = v;})(obj,val)');
				}
			}

			return curobj;

		},

		parseISO8601 : function(str) {
			/**
			 * parse ISO8601 "YYYY-MM-DDTHH:MM:SS+TTTT" to Date().
			 */
			var p = str.match(/(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?T(\d{2})(?::(\d{2})(?::(\d{2})(?:\.(\d+))?)?)(Z|([+-]\d{2})(?::?(\d{2}))?)/);
			if (p === null) {
				throw new Error('ISO8601ParseError', 'Invalid ISO8601 DateTime : ' + str);
			}
			for ( var i = 0; i < p.length; i++) {
				switch (i) {
				case 2:
				case 3:
					if (p[i] === undefined) {
						p[i] = '01';
					}
					;
					break;
				case 4:
				case 5:
				case 6:
				case 7:
				case 9:
				case 10:
					if (p[i] === undefined) {
						p[i] = '00';
					}
					;
					break;
				case 8:
					if (p[i] === 'Z') {
						p[9] = '+00';
					}
					;
					break;
				}
			}
			return new Date(Date.parse([ p[1], p[2], p[3] ].join('/') + ' ' + [ p[4], p[5], p[6] ].join(':') + ' GMT' + [ p[9], p[10] ].join('')));
		},

		toISO8601 : function(date) {
			/**
			 * Date() to ISO8601 string.
			 * need jquery-json.js
			 */
			return $.toJSON(date).replace(/"/g, '');
		},

		dateformat : function(date, format, to_utc) {
			/**
			 * format Date() with dateformat (Java SimpleDateFormat())
			 * 
			 * @param date
			 *            Date()
			 * @param format
			 *            dateformat string. supported: YymndjHGisShgaA. default -
			 *            yyyy/M/d h:mm
			 */
			to_utc = (to_utc === undefined) ? false : true;
			format = (format === undefined) ? 'yyyy/M/d h:mm' : format;
			function pad0(num, len) {
				return ('000000' + num).split('').reverse().splice(0, len).reverse().join('');
			}
			var dt = date, y, M, d, H, m, s, S;
			if (to_utc) {
				y = dt.getUTCFullYear();
				M = dt.getUTCMonth() + 1;
				d = dt.getUTCDate();
				H = dt.getUTCHours();
				m = dt.getUTCMinutes();
				s = dt.getUTCSeconds();
			} else {
				y = dt.getFullYear();
				M = dt.getMonth() + 1;
				d = dt.getDate();
				H = dt.getHours();
				m = dt.getMinutes();
				s = dt.getSeconds();
			}
			S = dt.getMilliseconds();
			
			var formatted = {
				yyyy : y,
				yy : (y + '').substring(2, 4), // year
				MM : pad0(M, 2),
				M : M, // month
				dd : pad0(d, 2),
				d : d, // day
				HH : pad0(H, 2),
				H : H, // hour
				mm : pad0(m, 2), // min
				m : m,
				ss : pad0(s, 2), // sec
				s : s,
				SSS : pad0(S, 3), // msec
				KK : pad0(H % 12, 2),
				K : H % 12,
				hh : pad0((H % 12) == 0 ? 12 : (H % 12), 2),
				h : (H % 12) == 0 ? 12 : (H % 12),
				a : H < 12 ? 'AM' : 'PM'
			};
			var ret = [], bit, bits = format.split("'");
			while (bits.length) {
				bit = bits.shift();
				if (bit == '') {
					ret.push('\'');
				} else {
					ret.push(bit.replace(/(yyyy|yy|[MdhHmsK]{1,2}|S{1,3}|a)/g, function(m0, m1, m2, idx) {
						return formatted[m1];
					}));
				}
				bit = bits.shift();
				if (bits.length) {
					ret.push(bit);
				}
			}
			return ret.join('');
		},
		
		dateCalc : function(base_date, delta_str) {
			/**
			 * calcurate Date().
			 * ex)
			 *   $.dateCalc(new Date(), '+1d');
			 *   $.dateCalc(new Date(), '-1y-1d');
			 *   $.dateCalc(new Date(), '+24h');
			 *   
			 * @param base_date Date()
			 * @param delta_str string delta from base_date.
			 *   format : [+-]\d+[yMdHms]
			 *   ex) '+1d' : after 1day, '-1d' before 1day, '1y, 1M' after 1 year and 1day
			 * @return Date() from base_date + delta_str
			 */
			var m = delta_str.match(/([-+]?\d+[yMdHms],?\s*)/g);
			if (m === null) {
				throw new Error('invalid delta_str: ' + delta_str);
			}
			var d = {'y' : 0, 'M' : 0, 'd' : 0, 'H' : 0, 'm' : 0, 's' : 0};
			$.each(m, function(i, v){
				var n = v.match(/^([-+]?\d+)([yMdHms])$/);
				d[n[2]] = parseInt(n[1], 10);
			});
			return new Date(base_date.getFullYear()+d.y, base_date.getMonth()+d.M, base_date.getDate()+d.d, base_date.getHours()+d.H, base_date.getMinutes()+d.m, base_date.getSeconds()+d.s);
		},

		relativeTime : function(date, options) {
			/**
			 * return relative time string.
			 * @param date Date()
			 * @param options {
			 *   now : <Date() : origin>,
			 *   dateformat : 'yyyy/M/d H:MM',
			 *   thresholds : [ [<min in seconds>, <duration in secons>, '<suffix string>'],
			 *   suffixes : [ '<ago string>', '<later string>']
			 * }
			 */
			options = $.extend({
				now : new Date(),
				dateformat : 'yyyy/M/d H:MM',
				thresholds : [ [ 10, 0, 'Now' ], [ 60, 1, ' sec' ], [ 60 * 60, 60, ' min' ], [ 2 * 60 * 60, 60 * 60, ' hour' ],
						[ 24 * 60 * 60, 60 * 60, ' hours' ], [ 2 * 24 * 60 * 60, 24 * 60 * 60, ' day' ], [ 30 * 24 * 60 * 60, 24 * 60 * 60, ' days' ] ],
				suffixes : [ ' ago', ' later' ]
			}, options);
			var suffix = (options.now.getTime() + 100 > date.getTime()) ? options.suffixes[0] : options.suffixes[1];
			var delta = Math.floor(Math.abs((options.now.getTime() - date.getTime()) / 1000));
			for ( var i = 0, l = options.thresholds.length; i < l; i++) {
				var th = options.thresholds[i];
				if (delta < th[0]) {
					if (th[1] > 0) {
						return Math.max(1, Math.floor(delta / th[1])) + th[2] + suffix;
					} else {
						return th[2];
					}
				}
			}
			return $.dateformat(date, options.dateformat);
		},
		
		calcAge : function(birthday_str) {
			/**
			 * calc age
			 * @param birthday_str 'yyyy-MM-dd'
			 * @return age int()
			 */
			var _birth = parseInt(birthday_str.replace(/[-\/]/g, ''));
			var _today = parseInt($.dateformat(new Date(), 'yyyyMMdd'));
			return parseInt((_today - _birth) / 10000);
		},

		numformat : {
			comma3 : function(v) {
				/**
				 * return 'comma formatted string' of number
				 */
				if (!isFinite(v) || isNaN(v)) {
					return v;
				}
				if (v < 1000 && v > -1000) {
					return new String(v);
				}
				v = (new String(v)).match(/^([-+]?)(\d+)(\.\d+)?$/);
				v[2] = v[2].replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
				v[3] = v[3] === undefined ? '' : v[3];
				return v[1] + v[2] + v[3];
			},
			round : function(v, pos, pad0) {
				/**
				 * return rounded number. 
				 * @param pos round position ( 0=1, 1=10, 2=100, -1=0.1, -2=0.01 )
				 * @param pad0 padding 0 for decimal points
				 */
				pad0 = (pad0 === undefined) ? true : pad0;
				pos = (pos === undefined) ? 0 : pos;
				var ret = v;
				if (pos < 0) {
					ret = Math.round(v * Math.pow(10, -pos)) / Math.pow(10, -pos);
				} else {
					ret = Math.round(v / Math.pow(10, pos)) * Math.pow(10, pos);
				}
				if (pad0 && pos < 0) {
					ret = ret.toFixed(-pos);
				}
				return ret;
			},
			kilo : function(v) {
				return $.numformat.round(v / 1024, -2, false);
			},
			mega : function(v) {
				return $.numformat.round(v / 1024 / 1024, -2, false);
			}
		},

		cookie : function(key, val, options) {
			/**
			 * get/set cookie
			 * @param key key
			 * @param val value
			 * @param options {
			 *   expires : <Date()>,
			 *   path : '<path>',
			 *   domain : '<domain>',
			 *   secure : <false|true>
			 * }
			 */
			if (arguments.length <= 1) {
				var cookies = {}, bit, bits = document.cookie.split('; ');
				while (bit = bits.shift()) {
					bit = bit.split('=');
					cookies[decodeURIComponent(bit[0])] = decodeURIComponent(bit[1] || '');
				}
				if (key !== undefined) {
					return cookies[key];
				}
				return cookies;
			} else {
				// delete cookie
				options = $.extend({
					expires : '',
					path : '',
					domain : '',
					secure : false
				}, options);
				if (val === null) {
					val = '';
					options.expires = -1;
					console.log('$.cookie:will delete:' + key);
				} else {
					console.log('$.cookie:will set:' + key + '=' + val);
					if ($.typeOf(key) != 'string'){
						throw new Error('$.cookie:key is not string.');
					}
					if ($.typeOf(val) != 'string' && $.typeOf(val) != 'number') {
						throw new Error('$.cookie:value is not string: ' + $.typeOf(val));
					}
				}
				if (options.expires) {
					if (typeof options.expires === 'number') {
						var days = options.expires, t = options.expires = new Date();
						t.setTime(+t + days * 864e+5);
					}
					if (!options.expires instanceof Date) {
						console.error('$.cookie: expires is not Date() : ' + key);
					}
				}
				return document.cookie = [ encodeURIComponent(key) + '=' + encodeURIComponent(val),
						options.expires ? ('; expires=' + options.expires.toUTCString()) : '',
						options.path ? ('; path=' + options.path) : '',
						options.domain ? ('; domain=' + options.domain) : '',
						options.secure ? '; secure' : '' ].join('');
			}

		},

		encodeHtml : function(text) {
			return _div.text(text).html();
		},

		decodeHtml : function(html) {
			return _div.html(html).text();
		},

		anchor : function(val, skip) {
			var fn = arguments.callee;
			switch (typeof val) {
			// getter
			case "undefined":
				var ret = location.hash;
				if (!ret) {
					return null;
				}
				ret = ret.replace(/^#/, "");
				return $.browser.fx ? ret : decodeURIComponent(ret);
				// callback
			case "function":
				if (!fn.tid) {
					fn.hash = location.hash;
					(function rec() {
						if (!fn.skip && fn.hash !== location.hash) {
							fn.hash = location.hash;
							$(window).trigger("changeAnchor", $.anchor());
						}
						fn.tid = setTimeout(rec, 300);
					})();
				}
				return $(window).bind("changeAnchor", val);
				// setter
			default:
				if (skip) {
					fn.skip = true;
					location.hash = encodeURIComponent(val);
					fn.hash = location.hash;
					fn.skip = false;
				} else {
					location.hash = encodeURIComponent(val);
				}
				return;
			}
		},

		loremIpsum : function(min_words, max_words) {
			/**
			 * make loremIpsum strings.
			 */
			min_words = (min_words === undefined) ? 5 : min_words;
			max_words = (max_words === undefined) ? 20 : max_words;
			var ret = [];
			var words_count = min_words + Math.floor(Math.random() * (max_words - max_words));
			for ( var i = 0; i < min_words; i++) {
				ret.push(loremIpsum_src[Math.round(Math.random() * loremIpsum_src.length)]);
			}
			for (i = min_words; i < words_count; i++) {
				ret.push(loremIpsum_src[Math.round(Math.random() * loremIpsum_src.length)]);
			}
			return ret.join(' ');
		},

		loadCss : function(href, flag) {
			/**
			 * load css file.
			 * @param href url
			 * @parm flag <true|false> load or unload
			 * @return loaded '<link>' element.
			 */
			if (flag == false) {
				return $.unloadCss(href);
				return;
			}
			if ($('head link[href="' + href + '"][rel="stylesheet"]')[0]) {
				return;
			}
			$('head').append('<link>');
			var css = $('head').children(':last');
			css.attr({
				'href' : href,
				'rel' : 'stylesheet'
			});
			return $('head').children(':last');
		},

		unloadCss : function(elem) {
			/**
			 * unload <link> element.
			 */
			if ($.typeOf(elem) === 'string') {
				elem = $('head link[rel="stylesheet"][href="' + elem + '"]');
			}
			elem.remove();
		},
		
		setStyle : function(style, id) {
			/**
			 * set <style> at <head>
			 * ex)
			 *   var $style = $.setStyle('body .someclass { display:none; }');
			 *   $.style.remove();
			 * @param style string
			 * @param id id for <style>
			 * @return <style> element
			 */
			var cnt = $.setStyle._cnt = ($.setStyle._cnt || 0) + 1, id = id || 'setstyle-' + cnt;
			$('#' + id).remove();
			return $('<style id="' + id + '">' + style + '</style>').appendTo($('head'));
		},
		
		getScrollbarWidth : function(){
			if (scrollbarWidth !== null) {
				return scrollbarWidth;
			}
			var div = $('<div>').css({
				position: 'absolute',
				top: '-100px',
				left: '-100px',
				width: '100px',
				height: '100px',
				overflowY: 'scroll'
			}).appendTo('body');
			scrollbarWidth = 100 - div[0].clientWidth;
			div.remove();
			return scrollbarWidth;
		},
		
		redraw : function(func){
			$('body').redraw(func);
		},
		
		arrayMap : function(array, key, ignore_null) {
			ignore_null = ignore_null === undefined ? true : ignore_null;
			var ret = {};
			$.each(array, function(i, v){
				if (ignore_null && v == null) {
					return;
				}
				if (key in v) {
					ret[v[key]] = v;
				} else {
					throw 'arrayMap():object array[' + i + '] is not have "' + key + '"';
					return false;
				}
			});
			return ret;
		},
		
		fontAvailable : function(fontName, teststr) {
			var width, height;
			// prepare element, and append to DOM
			var element = $('#_fontavailable');
			if (!element[0]) {
				element = $(document.createElement('span')).attr('id', '_fontavailable').css({
					'visibility': 'hidden',
					'position': 'absolute',
					'top': '-10000px',
					'left': '-10000px'
				}).html('abcdefghijklmnopqrstuvwxyz' + (teststr || '')).appendTo(document.body);
			}

			// get the width/height of element after applying a fake font
			width = element.css('font-family', '__FAKEFONT__').width();
			height = element.height();

			// set test font
			element.css('font-family', fontName);

			return width !== element.width() || height !== element.height();
		}
		
	});
	
	var _imgtest = $('<img>')[0];
	_imgtest = 'naturalWidth' in _imgtest ? 0 : 'runtimeStyle' in _imgtest ? 1 : 2;
	
	function dumpHTMLElement(v) {
		if (v === window) return 'Window';
		if (v.nodeName) return v.nodeName + (v.id ? '#'+v.id : '') + (v.className ? ('.' + v.className.split(/\s+/).join('.')) : '');
		return "" + v;
	};

	var _toString = $.fn.toString;
	$.fn.extend({
		
		// http://jsfiddle.net/g30rg3/x8Na8/171/
		// http://stackoverflow.com/questions/2360655/jquery-event-handlers-always-execute-in-order-they-were-bound-any-way-around-t
		bindFirst : function(name, fn) {
			this.on(name, fn);
			this.each(function(){
				var handlers = $._data(this, 'events')[name.split('.')[0]];
				var handler = handlers.pop();
				handlers.splice(0, 0, handler);
			});
		},
		
		toString : function(){
			if (this[0]) {
				return '[object jQuery:' + this.selector +':[' + this.map(function(i, v){return dumpHTMLElement(v);}).toArray().join(',') + ']]';
			}
			return _toString.call(this) + '';
		},
		
		tagName : function() {
			return this.nodeName;
		},

		outerHTML : function(s) {
			if (s) {
				this.before(s);
				return s.append(this);
			} else {
				return $('<div>').append(this.clone()).html();
			}
		},

		innerHTML : function(html) {
			if (arguments.length == 0) {
				return this.html();
			}
			this[0].innerHTML = html;
			return this;
		},
		
		naturalSize : function () {
			/**
			 * @return { width:<num>, height:<num>, src:"<src>" }, null : not img or no src or error, false : not loaded yet,
			 */
			var img = this[0];
			if (img.nodeName !== "IMG") {
				return null;
			}
			//var src = this[0].attr('src');
			if (!img.src) {
				return null;
			}
			if (img.complete === undefined || img.readyState == 'uninitialized') {
				return false;
			}
			var w, h;
			if (_imgtest == 0) {
				w = img.naturalWidth;
				h = img.naturalHeight;
			} else if (_imgtest == 1) {
				var img2 = new Image;
				img2.src = img.src;
				w = img2.width;
				h = img2.height;
			} else {
				var ow = img.width, oh = img.height;
				img.removeAttribute('width');
				img.removeAttribute('height');
				w = img.width;
				h = img.height;
				img.width = ow;
				img.height = oh;
			}
			if (img.complete == true && w === 0) {
				// img.complete and error on Chrome, Firefox, Safari
				return null;
			}
			return (w === 0 || w === undefined) ? false : {
				elm: this,
				src: this.attr('src'),
				width: w,
				height: h
			};
		},
		
		imagesLoaded : function(func, timeout){
			timeout = (timeout === undefined) ? 30 : timeout;
			var $images = $(this).find('img[src]').add( $(this).filter('img[src]') ).addClass('img_loading');
			var _d = $.Deferred(function(_d){
				var _ds = [];
				$images.each(function(){
					var _d = $.Deferred();
					_ds.push(_d);
					var $img = $(this);
					if ($img.naturalSize()) {
						$img.removeClass('img_loading');
						_d.resolve($img.naturalSize());
					} else {
						$img.one('load.imagesLoaded', function(){
							$.poll(function(){
								var size = $img.naturalSize();
								return size === false;
							}, -1, 20).always(function(){
								$img.removeClass('img_loading');
								_d.resolve($img.naturalSize());
							});
						}).one('error.imagesLoaded', function(){
							_d.resolve({
								'error ' : arguments
							});
							$img.removeClass('img_loading').addClass('img_load_error');
						});
						if ($img[0].complete || ($.browser.msie && $.browser.version < 9) ) {
							// for cached image
							$img.trigger('load');
						}
					}
				});
				$.when.apply(null, _ds).always(function(){
					func && func.call(this, $images);
					_d.resolve(arguments);
				});
			});
			return func ? $images : _d;
		},
		
		redraw : function(func) {
			return this.hide(0, function(){$(this).show(); func && func($(this)); });
		},
		
		overflowed : function() {
			/* -5 for chrome bug (scrollHeight+1,2) */
			var ret = this[0].clientHeight < this[0].scrollHeight - 5;
			return ret;
		},
		
		getFontSize : function() {
			if (document && document.defaultView && document.defaultView.getComputedStyle) {
				return parseInt(document.defaultView.getComputedStyle(this[0], null).fontSize);
			}
			var $tmp = $('#getFontSize')[0] ? $('#getFontSize') : $('<div id="getFontSize">').css({
				'width':'1em',
				'height':'1em',
				'line-height':'1em',
				'padding':0,
				'position':'absolute'
			}).appendTo('body');
			$tmp.appendTo(this).show();
			var ret = $tmp[0].offsetWidth;
			$tmp.appendTo('body').hide();
			return ret;
		},
		
		adjustFontSizeNoWrap : function(){
			// adust font size without auto-wrap
			this.each(function(){
				var $this = $(this).wrapInner('<div></div>');
				var $wrapped = $this.children('div').css({
					'white-space': 'nowrap',
					'padding' : 0,
					'margin' : 0,
					'width': 'auto',
					'font-size': 'inherit',
					'letter-spacing': 'inherit'
				});
				var ratio = $wrapped[0].clientWidth / $wrapped[0].scrollWidth;
				var fs = Math.floor($this.getFontSize() * ratio);
				if (ratio < 1) {
					$this.css('font-size', fs + 'px' );
					console.log('adjustFontSize():adjusted by ratio:' + $this + ':' + fs);
				}
				while (fs > 9 && $wrapped.css('white-space', 'normal').height() != $wrapped.css('white-space', 'wrapped').height()) {
					fs = Math.floor(fs * 0.9);
					$wrapped.css('font-size', fs + 'px');
				}
				console.log('adjustFontSize():adjusted by resize:' + $this + ':' + fs);
				
				$wrapped.contents().unwrap();
			});
			return this;
		},
		
		scrollIntoView : function(opts) {
			opts = $.extend({
				margin: 15
			}, opts);
			var margin = opts.margin;
			var container = window;
			var ct = $(container).scrollTop(), ch = container.clientHeight || $(container).height(), cb = ct + ch;
			var t = this.offset().top, h = this.outerHeight(), b = t + h;
			var nt = ct;
			if (t > cb) {
				nt = b - ch + margin;
				ct = nt;
			}
			if (b < ct) {
				nt = t - margin;
			} else if (t < ct) {
				nt = t - margin;
			}
			$(container).scrollTop(nt);
		},
		
		autogrow : function(opts){
			/**
			 * auto grow height of textareas as no scrollbar.
			 */
			
			opts = $.extend({
				autoShrink: false,
				minRows: 4,
				growRows: 4
			}, opts);
			function ta_autogrow($ta) {
				if ($ta.is(':visible')) {
					var opts = $ta.data('autogrow');
					if (opts.autoShrink) {
						var lines = $ta.val().split('\n').length;
						// $ta.css('height', opts.minHeight + opts.lineHeight * (lines-1));
						$ta.attr('rows', lines);
						console.log(lines);
					}
					while ($ta[0].clientHeight < $ta[0].scrollHeight - 1) {
						// $ta.css('height', ($ta[0].scrollHeight + opts.lineHeight * opts.growRows) + 'px');
						$ta.attr('rows', (parseInt($ta.attr('rows'), 10) || 0) + opts.growRows );
					}
				}
			}
			return this.each(function(){
				var $ta = $(this);
				if (!$ta.is('textarea')) {
					return;
				}
				$ta.css('overflow-y', 'hidden');
				$ta.off('keyup.autogrow change.autogrow focus.autogrow')
					.on('keyup.autogrow change.autogrow focus.autogrow', function(ev){
						var $ta = $(this), opts = $ta.data('autogrow');
						ta_autogrow($ta);
					});
				$ta.data('autogrow', opts);
				if (!$ta._autogrow_val) {
					$ta._autogrow_val = $ta.val;
					$ta.val = function(){
						return $ta._autogrow_val.apply($ta, arguments);
					};
				}
				ta_autogrow($ta);
			});
		}
		
		/* いまいち。childをいじってる系で使えない
		captureDocumentWrite : function(script) {
			var $this = $(this), state = {
				w : document.write,
				wl : document.writeln,
				buf : ''
			};
			console.log('captureDocumentWrite:' + script);
			document.write = function(str){
				state.buf += str;
			};
			document.writeln = function(str){
				sate.buf += str + '\n';
			};
			var $div = $('<div id="captureDocumentWrite">').appendTo($('body'));
			if (script.match(/^(https?:)?\/\//)){
				$('<div>').appendTo($div).replaceWith('<script src="' + script + '"></script>');
				$.doLater(function(){
					console.log('captureDocumentWrite:captured:' + state.buf);
					$this.html(state.buf + $div.html());
					document.write = state.w;
					document.writeln = state.wl;
					state = null;
				}, 100);
			} else if (script[0] == '<') {
				$('<div>').appendTo($div).replaceWith(script);
				$.doLater(function(){
					console.log('captureDocumentWrite:captured:' + state.buf);
					$this.html(state.buf);
					document.write = state.w;
					document.writeln = state.wl;
					state = null;
				}, 100);
			} else {
				$('<div>').appendTo($this).replaceWith('<script>' + script + '</script>');
				$.doLater(function(){
					console.log('captureDocumentWrite:captured:' + state.buf);
					$this.html(state.buf);
					document.write = state.w;
					document.writeln = state.wl;
					state = null;
				}, 100);
			}
			return this;
		}
		*/
		
	});
	
	var Mask = function(elem, opts) {
		this.opts = opts;
		this.$elem = $(elem);
	};
	
	// $.fn.cssHooks
	
	function getMetrics($elem){
		var h = $elem.outerHeight();
		var w = $elem.outerWidth();
		var t = $elem.position().top;
		var l = $elem.position().left;
		var margin = $elem.css('margin');
		var borderRadius = $elem.css('border-radius');
		return {
			'border-radius' : borderRadius,
			position: $elem.css('position') == 'fixed' ? 'fixed' : 'absolute',
			margin: margin,
			top: t + 'px',
			left: l + 'px',
			height: h + 'px',
			width: w + 'px',
			zIndex: $elem.css('z-index')
		};
	}
	
	Mask.prototype = {
		constructor: Mask,
		toggle : function(){
			return this[!!is_shown ? 'hide' : 'show'].apply(this, arguments);
		},
		show : function(opts, proc){
			var $elem = this.$elem.addClass('masked');
			this.is_shown && this.$mask.hide();
			opts = $.extend(this.opts, opts);
			var className = opts.className;
			className = className.call ? className(this.$elem) : className;
			var mask = this.$mask || this.$elem.next('.' + className);
			if (!mask[0]) {
				mask = $('<div>').addClass(className).appendTo(this.$elem.offsetParent());
			}
			var css = getMetrics($elem);
			mask = mask.clone();
			mask.css($.extend(opts.css, { opacity:opts.opacity, background:opts.background }, css))
				.appendTo(this.$elem.offsetParent());
			
			$elem.on('changemetrics.mask', function(){
				mask.css($.extend(opts.css, { opacity:opts.opacity, background:opts.background }, css = getMetrics($(this))));
			});
			
			proc && proc.call && proc.call(this, mask);
			this._org_style = $elem.attr('style');
			this._org_position = $elem.css('position');
			if (this._org_position == 'static') {
				$elem.css('position', 'relative');
			}
			this._org_display = $elem.css('display');
			if (this._org_display == 'inline') {
				$elem.css('display', 'inline-block');
			}
			mask.show();
			this.$mask = mask;
			this.is_shown = true;
		},
		hide : function(opts, proc){
			if (!this.is_shown){
				return;
			}
			this.$elem.off('changemetrics.mask');
			opts = $.extend(this.opts, opts);
			this.$elem.css('position', this._org_position);
			this.$elem.css('display', this._org_display);
			if (this._org_style) {
				this.$elem.attr('style', this._org_style);
			} else {
				this.$elem.removeAttr('style');
			}
			this.$elem.removeClass('masked');
			this.$mask.hide();
			this.is_shown = false;
		},
		destroy : function(){
			this.$elem.off('changemetrics.mask');
			this.hide();
			this.$mask && this.$mask.remove();
			this.$elem.removeData('mask').removeClass('masked');
		}
	};
	
	$.fn.mask = function(opts, proc){
		/**
		 * mask and unmask
		 * $(elem).mask();
		 * $(elem).mask({
		 *   show: true,
		 *   className : 'customMask' or function(elem){}
		 * });
		 * $(elem).mask('hide');
		 */
		if ($.isFunction(opts)) {
			proc = opts;
			opts = {};
		}
		return this.each(function(){
			var $this = $(this), data = $this.data('mask'), 
				_opts = $.extend({}, $.fn.mask.defaults, $this.data(), typeof opts == 'object' && opts);
			if (!data) $this.data('mask', (data = new Mask(this, _opts)));
			if (typeof opts == 'string') data[opts](_opts, proc);
			else if (_opts.show) data.show(_opts, proc);
		});
	};
	
	$.fn.mask.defaults = {
		show : true,
		className : 'mask',
		css : {
			'display' : 'block',
			'position' : 'absolute',
			'-webkit-box-sizing' : 'border-box',
			'-moz-box-sizing' : 'border-box',
			'-mz-box-sizing' : 'border-box',
			'-o-box-sizing' : 'border-box',
			'box-sizing' : 'border-box'
		}
	};
	
	// workaround for safari bug 
	//   getComputedStyle().getPropretyValue is not support shorthand
	$.doLater(function(){
		var s = $.setStyle('#cssstest { margin:10px; }'), t = $('<div id="cssstest">').appendTo($('body'));
		if (t.css('margin') != t.css('margin-left')) {
			// alert('getComputedStylle is not support shorthand');
			function mapSubProp(prop, repl, repls){
				return $.closure([prop, repl], null, function(prop, sub, elem, computed, extra){
					$elem = $(elem);
					return $.map(repls, function(v){
						return $elem.css(prop.replace(repl, v));
					}).join(' ');
				});
			}
			function mapDirections(prop){
				return mapSubProp(prop, 'Direction', ['Top', 'Right', 'Bottom', 'Left']);
			}
			$.each({
				'margin': mapDirections('marginDirection'),
				'padding': mapDirections('paddingDirection'),
				'borderWidth': mapDirections('borderDirectionWidth'),
				'borderColor': mapDirections('borderDirectionColor'),
				'borderStyle': mapDirections('borderDirectionStyle'),
				'border' : mapSubProp('borderSub', 'Sub', ['Width', 'Color', 'Style']),
				'borderTop': mapDirections('borderTopDirection'),
				'borderRight': mapDirections('borderRightDirection'),
				'borderBottom': mapDirections('borderBottomDirection'),
				'borderLeft': mapDirections('borderLeftDirection'),
				'borderImage': mapSubProp('borderImageSub', 'Sub', ['Source', 'Slice', 'Width', 'Outset', 'Repeat']),
				'outline': mapSubProp('outlineSub', 'Sub', ['Color', 'Style', 'Width']),
				'borderRadius': mapSubProp('borderCornerRadius', 'Corner', ['TopLeft','TopRight','BottomRight','BottomLeft']),
				'font': mapSubProp('fontSub', 'Sub', ['Style', 'Veriant', 'Weight', 'Size', 'Family']), // XXX: size[/lineheight]
				'background': mapSubProp('backgroundSub', 'Sub', ['Color', 'Image', 'Repeat', 'Attachment', 'Position']),
				'listStyle': mapSubProp('listStyleSub', 'Sub', ['Type', 'Position', 'Image']),
				'transition': mapSubProp('transitionSub', 'Sub', ['Property', 'Duration', 'TimingFunction', 'Delay'])
			}, function(k, v){
				$.cssHooks[k] = {
					get : v,
					set : $.closure([k], null, function(prop, elem, value) {
						elem.style[k] = value;
					})
				};
			});
		}
		t.remove(); s.remove();
	},10);
	if ($.browser.msie) {
		// XXX: outerWidth is very slow...
	}
	
	if ($.browser.android) {
		// bug workaround type="date" on Android 4.0.4 Build/IMM76D
		$(document).on('focus', 'input[type="date"]', function(ev){
			$(this).val($(this).val().replace(/^(\d+)-(\d)-(\d+)$/, '$1-0$2-$3').replace(/^(\d+)-(\d+)-(\d)$/, '$1-$2-0$3'));
		});
	}
	
	// events
	
	// see http://stackoverflow.com/questions/1449666/create-a-jquery-special-event-for-content-changed
	$.fn.watch = function(id, opts) {
		/**
		 * Watch some value and trigger 'change', 'start' and 'end' function.
		 * $(elem).watch('some id', {
		 *   interval: 100,
		 *   watch: function(){
		 *     return $(this).some.watching.value;
		 *   },
		 *   onchange: function(id, mode, old, cur) {
		 *     if (mode == 'start') {...}
		 *     else if (mode == 'change') {...}
		 *     else if (mode == 'end') {...}
		 *   }
		 * });
		 */
		opts = $.extend({
			interval: 250,
			watch: function(){},
			onchange: function(id, mode, old, cur){}
		}, opts);
		return this.each(function(){
			var _self = this;
			var o = opts.watch.call(_self), n, m = 0, s = 0;
			$(_self).data('watch_t', setInterval(function(){
				if ((n = opts.watch.call(_self)) !== o) {
					if (m == 0) {
						m = 1;
						s = n;
						opts.onchange.call(_self, id, 'start', o, n);
					} else {
						opts.onchange.call(_self, id, 'change', o, n, s);
					}
					o = n;
				} else {
					if (m == 1) {
						m = 0;
						opts.onchange.call(_self, id, 'end', s, n);
					}
				}
			}, opts.interval));
		});
	};
	
	$.fn.unwatch = function(id){
		return this.each(function(){
			clearInterval($(this).data('watch_t'));
		});
	};
	
	function watchScrollTop(){ return $(this).scrollTop(); }
	function watchSize(){ var t = $(this); return t.width() + ',' + t.height(); }
	function watchOverflow() {
		return $(this).innerHeight() < $(this)[0].scrollHeight;
	}
	function watchMetrics(){
		return $.toJSON(getMetrics($(this)));
	}
	
	$.each([
		['scrolling',	'scrolling', watchScrollTop, 'change'],
		['scrollstart',	'scrolling', watchScrollTop, 'start'],
		['scrolled',	'scrolling', watchScrollTop, 'end'],
		['resizing',	'resizing',  watchSize, 'change'],
		['resizestart',	'resizing',  watchSize, 'start'],
		['resized',		'resizing',  watchSize, 'end'],
		['overflow',  'overflow', watchOverflow, 'start'],
		['changemetrics',  'changemetrics', watchMetrics, 'start']
	], function(i, v){
		
		var eventType = v[0], watchId = v[1], watchFunc = v[2], watchType = v[3];
		$.event.special[eventType] = {
			setup: function(data, namespace, eventHandle){
				$(this).watch(watchId + '.' + watchType, {
					watch: watchFunc,
					onchange: function(id, type, old, cur, start){
						if (type == watchType) {
							var ev = $.Event(eventType);
							ev[eventType] = { start: start, old:old, cur: cur };
							$.event.handle.call(this, ev);
						}
					}
				});
			},
			teardown: function(){
				$(this).unwatch(watchId);
			}
		};
		
		$.fn[eventType] = function(fn){
			return this.on(eventType, fn);
		};
		
	});
	
	/* 重くなる : jquery-mobile-touch.js に移管
	var touch = null, has_android_touch_bug = ($.browser.android && $.browser.android.version >= "3.0.0" && $.browser.android.version < "4.1.0");
	
	function calcTouchDelta(){
		var radian = Math.atan2(touch.delta.y, touch.delta.x);
		var angle = Math.round(radian * 180 / Math.PI);
		if (angle < 0) {
			angle = 360 - Math.abs(angle);
		}
		touch.angle = angle;
		if (angle <= 45 || angle >= 315) {
			touch.direction = 'right';
		} else if (angle > 45 && angle < 135) {
			touch.direction = 'down';
		} else if (angle >= 135 && angle <= 225) {
			touch.direction = 'left';
		} else {
			touch.direction = 'up';
		}
		touch.distance = Math.round(Math.sqrt(Math.pow(touch.delta.x, 2)+Math.pow(touch.delta.y, 2)));
	}
	
	$(document).on('touchstart', function(ev){
		var oev = ev.originalEvent, ot = oev.touches ? oev.touches[0] : oev;
		touch = {
			start: {
				x: ot.clientX, y: ot.clientY,
				px: ot.pageX, py: ot.pageY
			},
			page_start: { x: ot.pageX, y: ot.pageY },
			target : ot.target
		};
	}).on('touchmove', function(ev){
		if (!touch) { return; }
		var oev = ev.originalEvent, ot = oev.touches ? oev.touches[0] : oev;
		touch.delta = {
			x: ot.clientX - touch.start.x,
			y: ot.clientY - touch.start.y,
			px: ot.pageX - touch.page_start.x,
			py: ot.pageY - touch.page_start.y,
			target: ot.target
		};
		// calcTouchDelta();
		if (has_android_touch_bug && Math.abs(touch.delta.y) < 5) {
			ev.preventDefault();
			$(touch.target).trigger($.Event('swiping', { origialEvent:ev, swipe:touch }));
		}
	}).on('touchend', function(ev){
		if (!touch || !touch.delta) { return; }
		// var oev = ev.originalEvent, ot = oev.touches ? oev.touches[0] : oev;
		touch.end = {
			x: touch.start.x + touch.delta.x,
			y: touch.start.y + touch.delta.y,
			px: touch.start.px + touch.delta.px,
			py: touch.start.py + touch.delta.py
		};
		calcTouchDelta();
		if (touch.distance > 30) {
			$(touch.target)
				.trigger($.Event('swipe', { originalEvent:ev, swipe:touch }))
				.trigger($.Event('swipe' + touch.direction, { originalEvent:ev, swipe: touch }));
			if (ev.type == 'mouseup') {
				ev.preventDefault();
			}
		}
		touch = null;
	});
	*/
	
})(jQuery);
