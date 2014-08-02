/**
 * @fileOverview HTML and JSON base template plugin.
 * 
 * @author shomwoys@gmail.com
 * @version 0.9
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
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * ********************************************************************
 * 
 * This plugin maps variables in JSON context to text/html/attributes of HTML
 * elements.
 * 
 * $(target).dataTmpl(context, options)
 * 
 * Target-Context Mapping
 * 
 * <ul>
 * <li>&lt;elem data-tmpl="XXX"&gt;&lt;/elem&gt; is placeholder for context.XXX</li>
 * <li>&lt;elem data-tmpl="XXX.YYY"&gt;&lt;/elem&gt; is placeholder for
 * context.XXX.YYY</li>
 * <li>&lt;elem data-tmpl="ARY:YYY"&gt;&lt;/elem&gt; is placeholder for
 * context.ARY[].YYY</li>
 * </ul>
 * 
 * Note1) data-tmpl="XXX.YYY" must be placed in data-tmpl="XXX". Note2)
 * data-tmpl="ARY" is iterated (copied) for context.ARY[] members.
 * 
 * Context Values Extract Patterns)
 * 
 * 1. Basic string
 * 
 * When context.XXX is string, &lt;elem data-tmpl="XXX"&gt;{html escaped
 * string&lt;/elem&gt;
 * 
 * if &lt;elem&gt; is &lt;img&gt;/&lt;a&gt;, string used for 'src'/'href.
 * 
 * 2. Basic formatted number/Date
 * 
 * When context.XXX is number, &lt;elem data-tmpl="XXX"&gt;{comma separated
 * number}&lt;/elem&gt;
 * 
 * When context XXX is Date(), &lt;elem data-tmpl="XXX&t;{dateformatted Date
 * string}&lt;/elem%gt;
 * 
 * 3. Object
 * 
 * 3.1 Normal Properties
 * 
 * When context.XXX is Object, properties used for child elements.
 * 
 * example:
 * 
 * <pre>
 * context = { prop1: { chprop1:&quot;aaa&quot;, chprop2:&quot;bbb&quot; } };
 * &lt;elem data-tmpl=&quot;prop1&quot;&gt;
 *   &lt;elem data-tmpl=&quot;prop1.chprop1&quot;&gt;placeholder&lt;/elem&gt;
 *   &lt;elem data-tmpl=&quot;prop1.chprop2&quot;&gt;placeholder&lt;/elem&gt;
 * &lt;/elem&gt;
 * -&gt;
 * &lt;elem data-tmpl=&quot;prop1&quot;&gt;
 *   &lt;elem data-tmpl=&quot;prop1.chprop1&quot;&gt;aaa&lt;/elem&gt;
 *   &lt;elem data-tmpl=&quot;prop1.chprop2&quot;&gt;bbb&lt;/elem&gt;
 * &lt;/elem&gt;
 * </pre>
 * 
 * 3.2 Special Properties '@html' and '@jquery'
 * 
 * property '@html' is treated as HTML attributes object.
 * 
 * example:
 * 
 * <pre>
 * context = { prop1: { '@html': { id:'prop1_id' }, 'chprop1':'aaa' };
 * &lt;elem data-tmpl=&quot;prop1&quot;&gt;
 *   &lt;elem data-tmpl=&quot;prop1.chprop1&quot;&gt;placeholder&lt;/elem&gt;
 * &lt;/elem&gt;
 * -&gt;
 * &lt;elem data-tmpl=&quot;prop1&quot; id=&quot;prop1_id&quot; &gt;
 *   &lt;elem data-tmpl=&quot;prop1.chprop1&quot;&gt;aaa&lt;/elem&gt;
 * &lt;/elem&gt;
 * </pre>
 * 
 * '@xxx' properties of '@html' object are treated as jQuery function
 * $().xxx(v).
 * 
 * example:
 * 
 * <pre>
 * context = { elem:'@html'{ id:'this_id', '@text':'&lt;b&gt;raw text', '@css'{ position:'relative' } } } }
 * &lt;elem data-tmpl=&quot;elem&quot;&gt;placeholder&lt;/elem&gt;
 * -&gt;
 * &lt;elem data-tmpl=&quot;elem&quot; id=&quot;this_id&quot; style=&quot;position:relative&quot;'&gt;&amp;lt;b&amp;gtraw text&lt;/elem&gt;
 * </pre>
 * 
 * property '@jquery' is treated as a function returns jQuery Object or
 * jQuery.Deferred.
 * 
 * jQuery Object function example;
 * 
 * <pre>
 * context = { elem:{'@jquery':function(key, context) { return $(this).append($('&lt;div&gt;aaa&lt;/div&gt;')); } } }
 * &lt;elem data-tmpl=&quot;elem&quot;&gt;&lt;/elem&gt;
 * -&gt;
 * &lt;elem data-tmpl=&quot;elem&quot;&gt;&lt;div&gt;aaa&lt;/div&gt;&lt;/elem&gt;
 * </pre>
 * 
 * jQuery.Deferred Object example:
 * 
 * <pre>
 * context = { elem: {'@jquery':$.getJSON('xxxx?callback=?') }}
 * # $.getJSON(...) response is { 'res1':'response' }
 * &lt;elem data-tmpl=&quot;elem&quot;&gt;
 *   &lt;elem data-tmpl=&quot;elem.res1&quot;&gt;placeholder&gt;/elem&lt;
 * &lt;/elem&gt;
 * -&gt;
 * &lt;elem data-tmpl=&quot;elem&quot;&gt;&lt;elem data-tmpl=&quot;elem.
 * </pre>
 * 
 * Switches)
 * 
 * data-tmpl="!context.VARNAME" enabled when context.VARNAME == false,[],{},0 or
 * Inf or NaN,empty string(space chars only),null,undefined
 * 
 * data-tmpl="?context.VARNAME" enabled when context.VARNAME == true,[not
 * empty],{not empty},not 0
 * 
 * Options)
 * 
 * <ul>
 * <li>target: "target" attribute of &lt;a&gt;</li>
 * <li>datetimeformat: "datetime format - $.datetimeformat() at jquery-utils.js</li>
 * <li>number_comma: format Number to comma separated (default true)</li>
 * <li>filters:{} filter functions hash.</li>
 * </ul>
 * 
 * <pre>
 *   {
 *      'XXX.YYY:ZZZZ':function(var, array_loop_counter1, context){
 *        return [filtered value];
 *    }
 * </pre>
 * 
 * if KEY is array, context is Array.
 * 
 * example:
 * <pre>
 * var context = {
 *    array:[
 *      {
 *       'image_path':'/path/to/img.jpg',
 *       'epoch':1234567,
 *       'link';'http://some.link.url/path/to/html.html',
 *       'count':123456
 *       },
 *    ]
 * },
 * var options = {
 *   target:'_top',
 *   number_comma:false,
 *   datetimeformat:'MM/dd',
 *   filters:{
 *     'array':function(v){
 *       return $.map(function(i,v){
 *         v.datetime = new Date(v);
 *         return v;
 *       });
 *     },
 *     'array:image_path':function(v){
 *       return 'http://some.img.domain'+v;
 *     },
 *     'array:datetime':function(v){
 *       return new Date(v);
 *     }
 *   }
 * }
 * $(target).dataTmpl(context,options);
 * </pre>
 * 
 * Simple Example)
 * <pre>
 * <div id="bookmarks" class="loading">
 *   <p>
 *   Link target is <a data-tmpl="link_url"></a>
 *   </p>
 *   <img data-tmpl="photo_link_url" witdh="100" height="100">
 *   <div data-tmpl="?bookmarks" class="bookmarks">
 *     <div data-tmpl="bookmarks">
 *       <span data-tmpl="bookmarks:memo">bookmarks[].memo placeholder</span>
 *       <span data-tmpl="bookmarks:time">bookmarks[].time placeholder</span>
 *       <a data-tmpl="bookmarks:link"></a>
 *     </div>
 *     <div data-tmpl="paging">
 *       <a href="paging.prev" target="_self">Prev</a>
 *       <a href="paging.next" target="_self">Next</a>
 *     </div>
 *   </div>
 *   <div data-tmpl="!bookmarks" class="no_bookmarks"> No Bookmarks.</div>
 * </div>
 * 
 * <script>
 * $(function(){
 *   var context = {
 *     link_url:'http://link.to/path',
 *     photo_link_url:'http://link.to/img.gif',
 *     bookmarks:[{
 *         memo:'memo1',
 *         time:Date(....),
 *         link:{'@html':{ href:'http://link.to.bookmark/1','@text':'bookmark1' }
 *       }, {
 *         memo:'memo2',
 *         time:Date(....),
 *         link:{'@as_html':{ href:'http://link.to.bookmark/1', '@text':'bookmark2'}
 *       }
 *     ],
 *     page= 2
 *   };
 *   var options = {
 *     filters:{
 *       page:function(v){
 *         return {
 *           prev:'?p='+(v-1),
 *           next:'?p='+(v+1)
 *         }
 *       }
 *     }
 *   };
 *   $('#bookmarks').dataTmpl(context,options).removeClass('loading'); });
 * </script>
 * 
 * </pre>
 * 
 * DataTmpl Class:
 * 
 * If you want to update template dynamically, you can use DataTmpl().
 * 
 * var tmpl = new $.DataTmpl($('#target')); tmpl.render(context);
 * 
 * equivarent
 * 
 * $('#target').dataTmpl(context); var tmpl = $('#target').data('DataTmpl');
 * 
 * and update object: tmpl.update(updated_context); // re-render all target.
 * 
 * spliceRows("KEY.FOR.ARRAY", position, delete_count, insert_array); //
 * similler to Array.splice()
 * 
 * shorthands for spliceRows:
 * 
 * <ul>
 * <li>target.insertRows("KEY.FOR.ARRAY", position, insert_array);</li>
 * <li>target.deleteRows("KEY.FOR.ARRAY", delete_count);</li>
 * <li>target.appendRows("KEY.FOR.ARRAY", insert_array);</li>
 * <li>target.prependRows("KEY.FOR.ARRAY", insert_array);</li>
 * </ul>
 * 
 * Current context is tmpl.context
 * 
 * target.selectRows("<key for array>", position, count) returns jQuery oject
 * for rows.
 * 
 */

(function($) {

	// $('<style>.tmpl_disabled { display:none!important; } .tmpl_waiting { } </style>').appendTo('head');
	
	var _cnt = 0;
	var _deferreds_cnt = 0;
	
	var default_options = {
		dateformat : 'yyyy/M/d H:mm:ss',
		number_comma : true,
		urlize : {
			linebreaksbr : true,
			trunc : [ 25, 20, false ],
			target : '_blank'
		},
		filters : {},
		show_context : false,
		logging : false,
		logging_depth : 1000,
		
		prefix : ''
	};
	
	function DataTmpl(element, options) {
		// this.element = element[0] ? element[0] : element;
		this.element = !!element.jquery ? element[0] : element;
		this.options = $.extend({
			prefix : '',
			count : 0,
			_depth: 0
		}, default_options, options);
		this._deferreds = [];
		this._deferreds_errors = [];
		this._arr_cnt = 0;
		this.errors = [];
		
		this._cnt = _cnt++;
		this._selector = (function(v){
			var id = $(v).attr('id'), className = $(v).attr('class');
			return v.nodeName + (id?'#'+id:'') + (className?('.'+className.split(/\s+/).join('.')):'');
		})(this.element);
		this._rendered = false;
		this.init();
	}
	
	DataTmpl.prototype._log_force = function() {
		var _self = this;
		if (!_self.options.logging || _self.options._depth > _self.options.logging_depth) {
			return;
		}
		var args = Array.prototype.slice.apply(arguments);
		args[0] = 'DataTmpl():' + (_self.options._parent ? '[' + _self.options.prefix + ']' : '[]') + ':' + _self._cnt + ':' + _self.options._depth + ':' + args[0];
		// args.splice(1, 0, this.element);
		args.unshift($(_self.element) + '');
		console.log.apply(console, args);
	};
	
	function DataTmplError(message, pos, key, value, ex){
		
	}
	DataTmplError.prototype = new Error()
	
	DataTmpl.prototype.addError = function(message, pos, key, value, target, ex) {
		// 'console' in window && console.error.apply(console, arguments);
		/*
		var ret = {
				'message' : message,
				'pos' : pos,
				'key' : key,
				'value' : value,
				'ex' : ex
		};
		*/
		ex.message = ex.message + ':DataTmpl:' + pos + ',key=' + key;
		ret = ex;
		this.errors.push(ret);
		// 'console' in window && console.error(ret);
		console.error(ret);
	};
	
	DataTmpl.prototype.hasError = function(){
		return this.errors.length > 0;
	};

	DataTmpl.prototype.addDeferred = function(d, k) {
		var _self = this;
		if (!$.isDeferred(d)){
			_self._log('addDeferred:ERROR:not deferred');
			return;
		}
		if (_self.deferred && _self.deferred.isRejected()) {
			_self._log('addDeferred:already rejected');
			d.reject('rejected');
			return _self.deferred;
		}
		d._cnt = ++_deferreds_cnt;
		_self._deferreds.push([d, k]);
		_self._log('addDeferred:' + d._cnt + ':k=' + k, _self.getDeferredsStates());
		d.then(function(res){
			_self._log('deferreds:' + this._cnt + ':done', res);
		}).fail(function(res){
			_self._log('deferreds:' + this._cnt + ':fail', res);
		});
		if (d.state() === 'pending') {
			_self._makeAllDeferred();
			_self.deferred = _self.deferred;
			_self.getDeferredsStates();
		}
		return _self.deferred;
	};
	
	DataTmpl.prototype.abort = function(ignore_self){
		var _self = this;
		_self._log('abort');
		if (!_self._rendered) {
			_self._log('abort : not _rendered');
			return;
		}
		var _d, aborted = false;
		while (_d = _self._deferreds.shift()) {
			var state = _d[0].state();
			_self._log('abort check : ' + _d[1] + ',' + state);
			if (state == 'pending') {
				_self._log('abort deferreds : reject : ' + _d[1]);
				_d[0].reject && _d[0].reject('abort', 'by parent');
				aborted = true;
			} else {
				_self._log('abort deferreds : through : ' + _d[1] + ':' + _d[0].state());
			}
		}
		if (aborted && !ignore_self) {
			_self._log('abort : _self.deferred');
			_self.deferred.reject && _self.deferred.reject('aborted', 'be self');
		}
		_self._log('abort : done');
		return _self;
	};
	
	DataTmpl.prototype.init = function() {

		var _self = this;
		var _elem = $(this.element);
		var _options = this.options;

		var elems = {
			targets : {},
			empties : {},
			toggles : {}
		};
		
		_self._log = _self.options.logging ? _self._log_force : function(){};
		
		var oldtmpl = $.data(this.element, 'DataTmpl');
		if (oldtmpl) {
			oldtmpl.clear();
			oldtmpl.destroy();
		}
		$.data(this.element, 'DataTmpl', this); //_elem.data('DataTmpl', this);

		_elem.find('[data-tmpl-row]').remove();

		_elem.find('[data-tmpl]').each(function() {
			var obj = $(this);
			var kn = obj.attr('data-tmpl'), f = kn.substring(0, 1);
			var k = 'targets';
			if (f == '!') {
				k = 'empties';
				kn = kn.substring(1);
			} else if (f == '?') {
				k = 'toggles';
				kn = kn.substring(1);
			}
			elems[k][kn] = (elems[k][kn] || $()).add(obj);
		});

		_elem.find('[data-tmpl^="' + _self.options.prefix + '"]').addClass('tmpl_disabled');

		_self.targets = elems;

		_self._showing_context = null;

		if (_options.show_context) {
			_elem.hover(function(ev) {
				$(this).bind('click.tmpl_context', function() {
					_self.show_context();
				}).css('outline', '1px dotted red');
				ev.stopPropagation();
				ev.preventDefault();
			}, function(ev) {
				$(this).unbind('click.tmpl_context').css('outline', '');
				ev.stopPropagation();
				ev.preventDefault();
			});
		}

		this._log('init()');
	};
	
	DataTmpl.prototype.destroy = function() {
		var _self = this;
		_self.abort();
		_self.targets = null;
		$(_self.element).removeData('DataTmpl');
		_self.element = null;
	};

	DataTmpl.prototype.filter_functions = {
		datetime : function(format) {
			return function(v) {
				return $.datetimeformat(v, format || this.options.datetimeformat);
			};
		},
		num_comma3 : function() {
			return function(v) {
				return $.number.comma3(v);
			};
		},
		num_round : function(pos, pad0) {
			return function(v) {
				return $.number.round(pos, pad0);
			};
		}
	};

	DataTmpl.prototype.fillElement = function(target, v, k, ignore_check) {
		/**
		 * @param target jQueryObject
		 *     target element
		 * @param v string,number.Date,Object
		 *     context value
		 *         v['@html'] extracts attributes.
		 *         v = { '@html':{ '@text':'<text value>',
		 *            '@html':'<html text>', '@style':{ <css prperty>:<css
		 *            property value>, ... }, '<attr>':'<value>', : } }
		 *            v['@jquery'] v = { '@jquery': <jQueryObject|function
		 *            returnjQueryOrDeferred(key, parent context)>, };
		 * @param k string current key
		 */
		var _self = this;
		var ret = true;
		var t = $.typeOf(v);
		
		// _self._rendered = true;

		if (!ignore_check) {
			var oldcontext = $.data(target[0], 'context'); // target.data('context');
			if (oldcontext === null) {
				// ignore always
			} else if ($.typeOf(oldcontext) != 'undefined') {
				// 変更前contextがある場合
				if (oldcontext === v) {
					ret = false;
					if (!ignore_check) {
						// contextが一致したら何もしない
						return false;
					}
				} else if (t === 'object' && $.toJSON(oldcontext) == $.toJSON(v)) {
					ret = false;
					if (!ignore_check) {
						// contextが一致したら何もしない
						return false;
					}
				}
				$.data(target[0], 'context', v); // target.data('context', v);
			} else {
				// target.data('context', v);
				$.data(target[0], 'context', v);
				if (v instanceof jQuery) {
					// 値がjquery objなら次は必ず更新
					$.data(target[0], 'context', null); // target.data('context', null);
				} else if (t == 'object') {
					// target.data('context', v);
					$.data(target, 'context', v);
					if (v['@html']) {
						$.each(v['@html'], function(k, v) {
							if (k[0] == '@') {
								// jquery関数があったら次は必ず更新
								$.data(target[0], 'context', null); // target.data('context', null);
								return false;
							}
							switch ($.typeOf(v)) {
							case 'number':
							case 'string':
							case 'boolean':
							case 'date':
								break;
							default:
								// 値が基本データ型以外([],{})なら次は必ず更新
								$.data(target[0], 'context', null); // target.data('context', null);
								return false;
							}
						});
					} else if (v['@jquery']) {
						// jquery objなら次は必ず更新
						$.data(target[0], 'context', null); // target.data('context', null);
					}
				}
			}
		}
		
		var _v = v;
		if (v instanceof jQuery) {
			_v = {
				'@jquery' : v
			};
		} else if (t === 'object') {
			_v = $.extend({}, v);
		}

		var tag = target[0].nodeName;

		switch (t) {
		case 'array':
			// XXX
			// throw new Error('DataTmpl.fillElement:invalid value (array) : ' + $(target).outerHTML());
			_self.addError('invalid value(array)', 'fillElement', k, v, target, null);
			target.addClass('tmpl_disabled');
			return false;
		case 'undefined':
		case 'null':
		case 'boolean':
			target.toggleClass('tmpl_disabled', !v);
			return ret;
			break;
		case 'date':
			_v = {
				'@html' : {
					'@text' : $.dateformat(v, this.options.dateformat)
				}
			};
			break;
		case 'number':
			if ($.inArray(tag, [ 'A', 'IMG', 'INPUT', 'SELECT', 'TEXTAREA' ]) < 0 && this.options.number_comma) {
				v = $.numformat.comma3(v);
			}
		case 'string':
			switch (tag) {
			case 'A':
				if (target.text() != '' || target.children().length > 0) {
					_v = {
						'@html' : {
							href : v
						}
					};
				} else {
					_v = {
						'@html' : {
							'@text' : v,
							'href' : v
						}
					};
				}
				break;
			case 'IMG':
				_v = {
					'@html' : {
						src : v
					}
				};
				break;
			case 'INPUT':
				switch (target.attr('type') || '') {
				case 'radio':
				case 'checkbox':
					_v = {
						'@html' : {
							'value' : v
						}
					};
					break;
				case 'button':
				case 'submit':
				case 'reset':
				case 'password':
					_v = {
						'@html' : true
					};
					break;
				default:
					_v = {
						'@html' : {
							'@val' : v
						}
					};
				}
				break;
			case 'SELECT':
			case 'TEXTAREA':
				_v = {
					'@html' : {
						'@val' : v
					}
				};
				break;
			default:
				_v = {
					'@html' : {
						'@text' : v
					}
				};
			}
		}
		var sub = _v['@jquery'];
		if (sub) {
			if (sub.call) {
				sub = sub.apply(target[0], [ k, _self.context ]);
			}
			if ($.isDeferred(sub)) {
				target.removeClass('tmpl_disabled').addClass('tmpl_waiting');
				_self.addDeferred($.Deferred(function(_d) {
					sub.then($.closure([ target, k ], this, function(target, k, res) {
						if (res) {
							var opts = $.extend({}, this.options);
							opts._parent = _self;
							opts._depth = opts._depth + 1;
							opts.prefix = k + '.';
							var newtmpl = $.data(target[0], 'DataTmpl') /*target.data('DataTmpl')*/ || new DataTmpl(target[0], opts);
							newtmpl.render(res, opts);
							_self.addDeferred(newtmpl.getAllDeferred().always(function(){
								_self.errors = _self.errors.concat(newtmpl.errors);
							}), k + '(tmpl sub)');
						}
						target.removeClass('tmpl_disabled');
						_d.resolve({
							pos : '_fillElement:@jquery',
							target: target,
							v: v,
							k: k,
							res: res
						});
					})).fail(function(ex) {
						_self._deferreds_errors.push({
							target : target,
							ex : ex
						});
						if (ex != 'abort') {
							alert(ex);
						}
						_d.reject({
							pos : '_fillElement:@jquery',
							target: target,
							v: v,
							k: k,
							ex: ex
						});
					}).always(function(res) {
						target.removeClass('tmpl_waiting');
						_self.context[k] = res;
					});
				}), k);
				return true;
			} else {
				target.empty().append(sub);
			}
			target.removeClass('tmpl_disabled');
			return ret;
		}

		if (!('@html' in _v)) {
			// throw new Error('DataTmpl.fillElement:invalid value (object has no @html) : ' + target.outerHTML());
			_self.addError('invalid value no @html', 'fillElement', k, v, target);
			return false;
		}

		var htmlobj = _v['@html'];

		for ( var attr in htmlobj) {
			var val = htmlobj[attr];
			if (attr[0] == '@') {
				val = !$.isArray(val) ? [ val ] : val;
				var func = attr.substring(1).replace(/:.*$/, '');
				if (!target[func]) {
					_self.addError('unknown jquery function:' + func, 'fillElement', k, v, target, new Error('DataTmpl:unknown jquery function:' + func));
				} else {
					target[func].apply(target, val);
				}
			} else {
				target.attr(attr, val);
			}
		}
		target.removeClass('tmpl_disabled');

		return ret;
	};

	DataTmpl.prototype.clearElement = function($target) {
		var _self = this;
		var ret = true;
		var v = $.data($target[0], 'context');
		if (v !== undefined) {

			var tag = $target[0].nodeName;
			var t = $.typeOf(v);
			var _v = v;

			switch (t) {
			case 'array':
				// throw new Error('DataTmpl.clearElement:invalid context (array) : ' + $(target).outerHTML());
				_self.addError('invalid contest (array)', 'fillElement', k, v, target);
				return false;
			case 'date':
			case 'number':
			case 'string':
				switch (tag) {
				case 'A':
					if ($target.text() != v || $target.children().length > 0) {
						$target.removeAttr('href');
					} else {
						$target.removeAttr('href').text('');
					}
					break;
				case 'IMG':
					$target.removeAttr('src');
					break;
				case 'INPUT':
					switch ($target.attr('type') || '') {
					case 'radio':
					case 'checkbox':
						$target.val('').attr('checked', false);
						break;
					case 'button':
					case 'submit':
					case 'reset':
					case 'password':
						break;
					default:
						$target.val('');
					}
					break;
				case 'SELECT':
				case 'TEXTAREA':
					$target.val('');
					break;
				default:
					$target.text('');
				}
				break;
			default:
				// context is not plain
				break;
			}
			$target.removeData('context').removeData('DataTmpl');
		}
		$target.addClass('tmpl_disabled');

	};

	DataTmpl.prototype.clear = function(ignore_self) {
		this._log('clear(' + !!ignore_self + ')');
		var _self = this;
		var _elem = $(this.element);

		_elem.find('[data-tmpl-row]').remove();
		_elem.find('[data-tmpl]').each(function() {
			_self.clearElement($(this));
		});
		_elem.find('[data-tmpl^="!"').addClass('tmpl_disabled');

		_self.context = {};
		if (this._showing_context) {
			this._showing_context.text($.toJSON(_self.context));
		}
	};
	
	DataTmpl.prototype.fillElements = function($target, v, k, opts) {
		var _opts = $.extend(this.options, opts);
		var _self = this;
		
		if ($.isFunction(v)) {
			v = v.call($target, k);
			t = $.typeOf(v);
		}

		if ($.isDeferred(v)) {
			$target.removeClass('tmpl_disabled').addClass('tmpl_waiting');
			_self.addDeferred($.Deferred(function(_d){
				v.then(function(res) {
					_self.fillElements($target, res, k, opts);
					_d.resolve({
						pos: '_fillElements:v is Deferred',
						target: $target,
						v: v,
						k: k,
						res: res
					});
				}).fail(function(res) {
					_self._deferreds_errors.push({
						target : $target,
						res : res
					});
					if (res != 'abort') {
						alert(res);
					}
					_d.reject({
						pos: '_fillElements:v is Deferred',
						target: $target,
						v: v,
						k: k,
						res: res
					});
				}).always(function(res) {
					$target.removeClass('tmpl_waiting').removeClass('tmpl_disabled');
					// $.resolve(_self.context, k, res);
				});
			}), k + '(fillElements)');
			return;
		}
		
		switch ($.typeOf(v)) {
		case 'array':
			_self._log('array', v);
			// var target = $(this);
			$target.attr('data-tmpl-arr', ++_self._arr_cnt).addClass('tmpl_disabled');
			var target_html = $target.outerHTML();
			while ($target.next().attr('data-tmpl-row') == k) {
				$target.next().remove();
			}
			var $newelm, $tmp = $target;
			var opts = $.extend({}, _opts);
			opts._parent = _self;
			opts._depth = opts._depth + 1;
			opts.prefix = k + ':';
			for ( var i = 0, l = v.length; i < l; i++) {
				if (i == l - 1 && v[i] === undefined) {
					break;
				} // for IE8-
				opts.count = i;

				$newelm = /* $target.clone(true) */$(target_html).attr('data-tmpl-row', k).removeAttr('data-tmpl').removeClass('tmpl_disabled');
				var newtmpl = new DataTmpl($newelm, opts);
				newtmpl.render(v[i]);
				_self.last_affected = _self.last_affected.add($newelm);
				$tmp.after($newelm);
				$tmp = $newelm;
				_self.addDeferred(newtmpl.getAllDeferred().always(function(){
					_self.errors = _self.errors.concat(newtmpl.errors);
				}), k + '[' + i + '](tmpl array)');
			}
			/*
			 * if (target[0].nodeName == 'OPTION'){
			 * target.parent('select').val(''); }
			 */
			break;
		case 'object':
			var _v = $.extend({}, v);
			if (_v['@html'] || _v['@jquery']) {
				_self.fillElement($target, {
					'@html' : v['@html'],
					'@jquery' : v['@jquery']
				}, k);
				delete _v['@html'];
				delete _v['@jquery'];
			}
			if (!$.isEmptyObject(_v)) {
				var opts = $.extend({}, _opts);
				opts._parent = _self;
				opts._depth = opts._depth + 1;
				opts.prefix = k + '.';
				var newtmpl = $.data($target[0], 'DataTmpl') /*$target.data('DataTmpl')*/ || new DataTmpl($target, opts);
				newtmpl.render(_v);
				_self.last_affected = _self.last_affected.add(newtmpl.last_affected);
				_self.addDeferred(newtmpl.getAllDeferred().always(function(){
					_self.errors = _self.errors.concat(newtmpl.errors);
				}), k + '(tmpl obj)');
			}
			$target.removeClass('tmpl_disabled');
			break;
		default:
			if (_self.fillElement($target, v, k)) {
				// modified
				_self.last_affected = _self.last_affected.add($(this));
			}
			$target.removeClass('tmpl_disabled');
		}
	};

	function _hide(t, v) {
		// ?<key>,!<key>用の隠すかどうか判定 
		// bool : false なら隠す
		// [] : empty array なら隠す
		// string: 空文字なら隠す
		// number: 0, isNaN, 無限大なら隠す
		// {} : 空オブジェクトなら隠す
		var hide = false;
		switch (t) {
		case 'boolean':
			hide = !v;
			break;
		case 'array':
			hide = (v.length === 0);
			break;
		case 'string':
			hide = !!(v.match(/^\s*$/));
			break;
		case 'number':
			hide = (v === 0 || isNaN(v) || v === Number.POSITIVE_INFINITY || v === Number.NEGATIVE_INFINITY);
			break;
		case 'object':
			hide = $.isEmptyObject(v);
			break;
		}
		return hide;
	}
	
	DataTmpl.prototype._makeAllDeferred = function(func){
		var _self = this;
		_self._log('_makeAllDeferred');
		_self.deferred = $.Deferred(func).then(function(){
			var args = Array.prototype.slice(arguments);
			args.unshift('render done');
			_self._log.apply(_self, args);
		}).fail(function(){
			var args = Array.prototype.slice(arguments);
			args.unshift('render fail');
			_self._log.apply(_self, args);
			_self.abort();
		});
	};
	
	DataTmpl.prototype.getAllDeferred = function(){
		var _self = this, ret = _self.deferred;
		_self._log('getAllDeferred');
		if (_self._deferreds.length > 0) {
			var _ds = $.map(_self._deferreds, function(v){return v[0];});
			$.when.apply(null, _ds).then(function() {
				var args = Array.prototype.slice(arguments);
				args.unshift('deferreds done');
				ret.resolveWith(_self, args);
			}).fail(function() {
				var args = Array.prototype.slice(arguments);
				args.unshift('deferreds failed');
				ret.rejectWith(_self, args);
			}).always(function(){
				if (_self.errors[0]) {
					console.log('DataTmpl: has errors');
					$.each(_self.errors, function(i, v){
						console.error(v.stack || v);
					});
				}
			});
		} else {
			ret && ret.resolveWith(_self, ['no deferreds']);
		}
		return ret;
	};
	
	DataTmpl.prototype.getDeferredsStates = function(){
		var _self = this;
		var stats = $.map(_self._deferreds, function(v) {return v[1] + ':' + v[0]._cnt + ':' + v[0].state(); });
		_self._log_force.apply(_self, stats);
		return stats;
	};

	DataTmpl.prototype.render = function(context, opts) {
		this._log('render(context, opts)', context, opts);
		
		var _self = this;
		var _elem = $(this.element);
		
		_self._rendered = true;
		
		opts = $.extend({}, opts);
		// opts = null;
		
		// if this has pending deferreds, abort.
		if (!opts.is_deferred && _self.deferred && _self.deferred.state() == 'pending') {
			_self._log('pending -> abort');
			_self.deferred.reject('aborted');
		}
		
		// if parent is rejected, abort
		if (_self.options._parent && _self.options._parent.deferred.isRejected()) {
			_self.abort();
			_self.deferred = $.Deferred().reject('parent aborted');
			return _elem;
		}
		
		if ($.isDeferred(context)) {
			_elem.removeClass('tmpl_disabled').addClass('tmpl_waiting');
			_self._makeAllDeferred(function(_d){
				var _d2 = context.then(function(res) {
					_elem.removeClass('tmpl_waiting');
					_self.render(res, $.extend({is_deferred:true}, opts));
				}).fail(function() {
					_self._log('render deferred context fail');
				});
				_self.addDeferred(_d2, '(context)');
			});
			return _elem;
		}
		
		_self._makeAllDeferred();
		
		_self.context = context;
		_self.last_affected = $();

		if (_self._showing_context) {
			_self._showing_context.text($.toJSON(this.context));
		}
		
		if ($.typeOf(context) !== 'object') {
			this.fillElement(_elem, context, '', true);
		} else {
			
			if ('@html' in context) {
				this.fillElement(_elem, context, '', true);
			}
	
			for ( var k in context) {
				if (k == '@html') {
					continue;
				}
				var v = context[k];
				var kn = (_self.options.prefix || '') + k;
	
				var $targets = _self.targets.targets[kn] || $();
				var $empties = _self.targets.empties[kn] || $();
				var $toggles = _self.targets.toggles[kn] || $();
	
				if (kn in _self.options.filters) {
					// filters : { kn : function(v, count, context), .. }
					try {
						if ($.isDeferred(v)) {
							_self.addDeferred(v, kn + '(filter)');
							v = $.closure([kn, k], _self, function(kn){
								return v.pipe(function(res) {
									try {
										return _self.options.filters[kn].call(_self, res, _self.options.count + 1, context);
									} catch (ex) {
										_self.addError('filter exception (deferred pipe success)', 'filter', kn, v, null, ex);
										return ex;
									}
								}, function(res){
									_self.addError('filter failed', 'filter', kn, v, null, res);
									return res;
								}).then(function(res){
									context[k] = res;
								});
							})();
						} else {
							try {
								v = _self.options.filters[kn].call(_self, v, _self.options.count + 1, context);
							} catch (ex) {
								_self.addError('filter exception', 'filter', kn, v, null, ex);
								v = false;
							}
						}
					} catch (ex) {
						_self.addError('filter exception', 'filter', kn, v, null, ex);
					}
				}

				var t = $.typeOf(v);

				if (t === 'undefined' || t === 'null') {
					t = 'boolean';
					v = false;
				}

				if (t === 'boolean') {
					$targets.toggleClass('tmpl_disabled', !v);
					$toggles.toggleClass('tmpl_disabled', !v);
					$empties.toggleClass('tmpl_disabled', !!v);
					continue;
				}

				if ($empties[0] || $toggles[0]) {
					var hide = _hide(t, v);
					$empties.toggleClass('tmpl_disabled', !hide);
					$toggles.toggleClass('tmpl_disabled', hide);
				}

				if (!$targets[0]) {
					continue;
				}

				$targets.each(function() {
					_self.fillElements($(this), v, kn, opts);
				});
			}

		}
		
		_self.deferred = _self.getAllDeferred();
		return _elem;
	};

	DataTmpl.prototype.update = function(context, opts) {
		this._log('update(context, opts)', context, opts);
		$(this.element).find('[data-tmpl-row]').remove();
		this.context = $.extend(this.context, context);
		this.render(this.context, opts);
		return this.last_affected;
	};
	
	DataTmpl.prototype.updatePartial = function(keys, context) {
		var _self = this;
		_self.last_affected = $();
		$.each(keys, function(i, key){
			if (key.indexOf(_self.options.prefix) != 0) {
				throw new Error('DataTmpl().selectRows():' + key + ' is not have prefix "'+ _self.options.prefix +'"');
			}
			var partial_key = key.substring(_self.options.prefix.length);
			var target = $.resolve(_self.context, partial_key);
			var v = $.resolve(context, partial_key);
			var t = $.typeOf(v);
			if (t == 'array') {
				key.match(/\[-1]\$/); // prepend
				key.match(/\[]\$/); // replace
				key.match(/\[last]\$/); // append
			}
			$(_self.element).find('[data-tmpl="' + key + '"]').each(function() {
				if ($(this).attr('data-tmpl-arr')) {
					alert('not implemented array update');
				} else {
					$.resolve(_self.context, partial_key, v);
					_self.fillElements($(this), v, key, _self.options); // XXX check
					_self.last_affected = _self.last_affected.add($(this));
				}
			});
			$(_self.element).find('[data-tmpl="?' + key + '"]').each(function(){
				_self.last_affected = _self.last_affected.add($(this));
				$(this).toggleClass('tmpl_disabled', _hide(t, v));
			});
			$(_self.element).find('[data-tmpl="!' + key + '"]').each(function(){
				_self.last_affected = _self.last_affected.add($(this));
				$(this).toggleClass('tmpl_disabled', !_hide(t, v));
			});
		});
		return _self.last_affected;
	};

	DataTmpl.prototype.selectRows = function(key, pos, count) {
		count = count === undefined ? 1 : count;
		var selected = $();
		if (key.indexOf(this.options.prefix) != 0) {
			throw new Error('DataTmpl().selectRows():' + key + ' is not have prefix "'+ this.options.prefix +'"');
		}
		var target_arr = $.resolve(this.context, key.substring(this.options.prefix.length));
		if ($.typeOf(target_arr) !== 'array') {
			throw new Error('DataTmpl().selectRows():' + key + ' is not an array.');
		}
		if (pos > target_arr.length - 1 || pos < 0) {
			return $();
		}
		$(this.element).find('[data-tmpl="' + key + '"][data-tmpl-arr]').each(function() {
			for ( var i = 0; i < count; i++) {
				selected = selected.add($($(this).parent().find('[data-tmpl-row="' + key + '"]')[pos + i]));
			}
		});
		return selected;
	},

	DataTmpl.prototype.appendRows = function(key, arr) {
		if (key.indexOf(this.options.prefix) != 0) {
			// throw new Error('DataTmpl().appendRows():' + key + ' is not have prefix "'+ this.options.prefix +'"');
			return $();
		}
		var target_arr = $.resolve(this.context, key.substring(this.options.prefix.length));
		if ($.typeOf(target_arr) !== 'array') {
			// throw new Error('DataTmpl().appendRows():' + key + ' is not an array.');
			return $();
		}
		var pos = target_arr.length;
		return this.spliceRows(key, pos, 0, arr);
	},

	DataTmpl.prototype.prependRows = function(key, arr) {
		return this.spliceRows(key, 0, 0, arr);
	};

	DataTmpl.prototype.insertRows = function(key, pos, arr) {
		return this.spliceRows(key, pos, 0, arr);
	};

	DataTmpl.prototype.deleteRows = function(key, pos, delete_count) {
		return this.spliceRows(key, pos, delete_count);
	};

	DataTmpl.prototype.updateRow = function(key, pos, update_context) {
		if (key.indexOf(this.options.prefix) != 0) {
			throw new Error('DataTmpl().updateRow():' + key + ' is not have prefix "'+ this.options.prefix +'"');
		}
		var target_arr = $.resolve(this.context, key.substring(this.options.prefix.length));
		if ($.typeOf(target_arr) !== 'array') {
			throw new Error('DataTmpl().updateRow():' + key + ' is not an array.');
		}
		if (pos < 0 || pos > target_arr.length - 1) {
			throw new Error('DataTmpl.updateRow : invalid pos');
		}
		target_arr[pos] = $.extend(target_arr[pos], update_context);
		$.resolve(this.context, key, target_arr);

		var target = $(this.selectRows(key, pos, 1)[0]);
		return $.data(target[0], 'DataTmpl').update(update_context); // target.data('DataTmpl').update(update_context);
	};

	DataTmpl.prototype.spliceRows = function(key, pos, delete_count, arr) {
		/**
		 * @param key context key string ex) 'data' means insert arr to
		 *            this.context.mean (array)
		 * @param pos insert position (0 origin)
		 * @param arr insert array at index <pos> of this.context[key]
		 *            (array)
		 */
		var _self = this;
		
		// if this has pending deferreds, abort.
		if (_self._rendered && _self.deferred && _self.deferred.state() == 'pending') {
			_self._log('pending -> abort');
			_self.deferred.reject('aborted');
		}
		
		if (_self.options._parent && _self.options._parent.deferred.isRejected()) {
			_self.abort();
			_self.deferred = $.Deferred().reject('parent aborted');
			return _self.last_affected;
		}
		
		_self._makeAllDeferred();

		if (key.indexOf(this.options.prefix) != 0) {
			throw new Error('DataTmpl().spliceRows():' + key + ' is not have prefix "'+ this.options.prefix +'"');
		}
		var partial_key = key.substring(this.options.prefix.length);
		var target_arr = $.resolve(this.context, partial_key);
		if ($.typeOf(target_arr) !== 'array') {
			throw new Error('DataTmpl().spliceRows():' + key + ' is not an array.');
		}
		if (pos >= target_arr.length) {
			pos = target_arr.length;
		}
		var is_delete = true;
		delete_count = (delete_count === undefined) ? 1 : delete_count;
		var args = [ pos, delete_count ];
		if (arr !== undefined) {
			is_delete = false;
			args = args.concat(arr);
		}
		target_arr.splice.apply(target_arr, args);
		$.resolve(this.context, partial_key, target_arr);

		_self.last_affected = $();

		$(this.element).find('[data-tmpl="' + key + '"][data-tmpl-arr]').each(function() {
			var target = $(this);
			// var idx = $(this).attr('data-tmpl-arr');

			// remove deleted
			if (delete_count > 0) {
				for ( var i = 0; i < delete_count; i++) {
					$($(this).parent().find('[data-tmpl-row="' + key + '"]')[pos]).remove();
				}
			}

			// insert
			if (!is_delete) {
				var tmp = (pos === 0) ? target : $($(this).parent().find('[data-tmpl-row="' + key + '"]')[pos - 1]);
				var opts = $.extend({}, _self.options);
				opts.prefix = key + ':';
				if (opts.filters[key]) {
					arr = opts.filters[key](arr);
					if ($.isDeferred(arr)){
						_self.addDeferred(arr, key);
					}
				}
				var target_html = target.outerHTML(), $newelm, newtmpl;
				for ( var i = 0, l = arr.length; i < l; i++) {
					if (i == l - 1 && arr[i] === undefined) {
						break;
					} // for IE8-
					opts.count = i + pos;
					$newelm = /* target.clone(true) */$(target_html).attr('data-tmpl-row', key).removeAttr('data-tmpl').removeClass('tmpl_disabled');
					tmp.after($newelm.dataTmpl(arr[i], opts));
					tmp = $newelm;
					_self.last_affected = _self.last_affected.add($newelm);
					newtmpl = $.data($newelm[0], 'DataTmpl'); //newelm.data('DataTmpl');
					
					/*
					_self.addDeferred(newtmpl.getAllDeferred().always(function(){
						_self.errors = _self.errors.concat(newtmpl.errors);
					}), key + '[' + i + '](tmpl)');
					*/
					(function(){
						var _d = $.Deferred();
						newtmpl.getAllDeferred().then(function(res){
							_self.errors = _self.errors.concat(newtmpl.errors);
							_d.resolve(res);
						}).fail(function(res){
							_self.errors = _self.errors.concat(newtmpl.errors);
							_d.reject(res);
						});
						_self.addDeferred(_d, key + '[' + i + '](tmpl)');
					})(newtmpl);
					
				}
			}
		});
		if (_self._showing_context) {
			_self._showing_context.text($.toJSON(_self.context));
		}
		return _self.last_affected;
	};

	DataTmpl.prototype.show_context = function() {
		if (this._showing_context) {
			return;
		}
		var _self = this;
		_self._showing_context = $('<div class="tmpl_context">').css({
			position : 'raltive',
			float : 'none',
			width : '100%',
			background : '#eee',
			padding : 0,
			margin : 0,
			'font-size' : '10px'
		}).text($.toJSON(_self.context)).click(function(ev) {
			$(this).remove();
			_self._showing_context = null;
			ev.stopPropagation();
			ev.preventDefault();
		}).prependTo($(this.element));
	};

	$.extend({
		DataTmpl : DataTmpl
	});

	$.fn.extend({
		/**
		 * dependency $.typeOf, $.dateformat (jquery-utils.js)
		 */

		dataTmpl : function(context, opts, _loop) {
			return this.each(function() {
				/*
				var tmpl = $.data(this, 'DataTmpl');
				if (tmpl) { // $(this).data('DataTmpl')) {
					tmpl.clear();
				}
				*/
				if (context == 'destroy') {
					var old = $(this).data('DataTmpl');
					old && old.destroy();
					return;
				}
				var datatmpl = new DataTmpl(this, opts);
				return datatmpl.render(context, opts, _loop);
			});
		}

	});

})(jQuery);
