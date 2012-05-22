/**
 * HTML and JSON base template plugin.
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
 * This plugin maps variables in JSON context to text/html/attributes of HTLM
 * elements.
 * 
 *     $(target).dataTmpl(contextObj, option)
 * 
 * Target-Context mapping) 
 * 
 * context.VARNAME
 *     <target>...<elem data-tmpl="VARNAME"></elem>...</target> .
 * context.VARNAME.CHILDNAME
 *     <target>...<elemdata-tmpl="VARNAME.CHILDNAME"></elem>...</target>.
 * context.ARRAY[x].CHILDNAME
 *     <target>...<elem data-tmpl="VARNAME:CHILDNAME"></elem>...</target>
 *     and iterate array elements.
 * context['@self'] affects target-self
 * 
 * Context-Extract)
 * 
 * 1. context.VARNAME is string, number or Date
 *     to Generic Elements
 *         string or number
 *             <elem data-tmpl="VARNAME">${context.VARNAME|html escaped}</elem>
 *         Date()
 *             <elem data-tmpl="VARNAME">${context.VARNAME|dateformatted string}</elem>
 * 
 *     to <a>
 *        when <a> is empty
 *            <a href="${context.VARNAME}" target="_blank">${context.VARNAME|escaped}</a>
 *        else
 *            <a href="${context.VARNAME}" target="_blank">Static String</a>
 * 
 *     to <img>
 *         <img>: <img src="${context.VARNAME}">
 * 
 * 2. context.VARNAME is Object:
 *     has '@as_html'
 *         extracted to element attributes.
 *         special variables:
 *             '@text' : text contents ($().text(xxx))
 *             '@html' : html contents ($().html(xxx))
 *             '@style : CSS attributes ($().css(obj))
 *     else
 *         generate child DataTmpl
 *         and '@self' is extracted for target attributes.
 * 
 * Switches)
 * 
 * data-tmpl="!context.VARNAME"
 *     enabled when context.VARNAME == false,[],{},0 or Inf or NaN,empty string(space chars only),null,undefined
 * data-tmpl="?context.VARNAME"
 *     enabled when context.VARNAME == true,[not empty],{not empty},not 0
 * 
 * Options)
 * 
 * target: "target" attribute of <a>
 * datetimeformat: "datetime format - $.datetimeformat() at jquery-utils.js
 * number_comma: format Number to comma separated (default true).
 * filters:{} filter functions hash.
 *    { 'context.VARNAME':function(var, array_loop_counter1, context){
 *        return [filtered value];
 *    }
 * 
 * Restriction)
 * 
 * elements for children must be in elements for parent.
 *     BAD:
 *         <elem data-tmpl="context.OTHER1"></elem>
 *         <elem data-tmpl="context.VARNAME.CHILDNAME"></elem>
 *         <elem data-tmpl="context.OTHER2"></elem>
 *     GOOD:
 *         <elem data-tmpl="context.OTHER1"></elem>
 *         <elem data-tmpl="context.VARNAME>
 *             <elem data-tmpl="context.VARNAME.CHILDNAME"></elem>
 *         </elem>
 *         <elem data-tmpl="context.OTHER2"></elem>
 * 
 * Example)
 * 
 * <div id="bookmarks" class="loading">
 *     <p>Link target is <a data-tmpl="link_url"></a></p>
 *     <img data-tmpl="photo_link_url" witdh="100" height="100">
 *     <div data-tmpl="?bookmarks" class="bookmarks">
 *         <div data-tmpl="bookmarks">
 *             <span data-tmpl="bookmarks:memo">bookmarks[].memo placeholder</span>
 *             <span data-tmpl="bookmarks:time">bookmarks[].time placeholder</span>
 *             <a data-tmpl="bookmarks:link"></a>
 *         <div>
 *         <div data-tmpl="paging">
 *             <a href="paging.prev_url" target="_self">Prev</a>
 *             <a href="paging.next_url" target="_self">Next</a>
 *         </div>
 *     </div>
 *     <div data-tmpl="!bookmarks" class="no_bookmarks"> No Bookmarks.</div>
 * </div>
 * 
 * <script>
 * $(function(){
 *     var context = {
 *         link_url:'http://link.to/path',
 *         photo_link_url:'http://link.to/img.gif',
 *         bookmarks:[
 *             { memo:'memo1',
 *               time:Date(....),
 *               link:{'@as_html':true, href:'http://link.to.bookmark/1', '@text':'bookmark1' }
 *              },
 *             { memo:'memo2',
 *               time:Date(....),
 *               link:{'@as_html':true, href:'http://link.to.bookmark/1', '@text':'bookmark2'}
 *              }
 *         ],
 *         paging = { prev:'?p=1', next:'?p=3', cur:'' }
 *     };
 *     $('#bookmarks').dataTmpl(context).removeClass('loading'); });
 * </script>
 * 
 * DataTmpl Class:
 * 
 * If you want to update template dynamically, you can use DataTmpl().
 * 
 * var target = new $.DataTmpl($('target4')); target.render(context);
 * 
 * equivarent
 * 
 * $('#target').dataTmpl(context);
 * 
 * and update object: target.update(updated_context); // re-render all
 * target.spliceRows("<key for array>", position, delete_count, insert_array); //
 * similler to Array.splice()
 * 
 * shorthand for spliceRows:
 * 
 * target.insertRows("<key for array>", position, insert_array);
 * target.deleteRows("<key for array>", delete_count);
 * target.appendRows("<key for array>", insert_array);
 * target.prependRows("<key for array>", insert_array);
 * 
 * Current context is target.context.
 * 
 * target.selectRows("<key for array>", position, count)
 * returns jQuery oject for rows.
 * 
 * Example:
 * 
 * <target>
 *     <title data-tmpl="title">context.title placeholder</title>
 *     <row data-tmpl="row">
 *         <span data-tmpl="row:col1">context.row[].col1 placeholder</span>
 *     </row>
 * </target>
 * <script>
 * $(function(){
 *     var target = new DataTmpl($("target"));
 *     target.render({
 *         'title':'Title',
 *         row:[{col1:"col1"},{col1:"col2"},{col1:"col3"}]
 *     });
 *     // update all elements for cotext.
 *     row target.update({ row:[{col1:"new-col1"},{col1:"new col2"}] });
 * 
 *     target.appendRows('row', { col1:"appended" });
 *     target.prependRows('row', { col1:"prepended" });
 *     target.selectRows('row', 3, 1).fadeOut(function(){
 *         target.deleteRows('row', 3, 1);
 *     });
 * 
 * }); </script>
 * 
 * 
 */

(function($) {
	
	$('<style>.tmpl_disabled { display:none!important; }</style>').appendTo('head');
	
	var default_options = {
	    dateformat : 'yyyy/MM/dd HH:mm:ss',
	    number_comma : true,
	    urlize : {
	        linebreaksbr : true,
	        trunc : [ 25, 20, false ],
	        target : '_blank'
	    },
	    filters : {}
	};
	
	function DataTmpl(element, options) {
		this.element = element;
		this.options = $.extend({
		    prefix : '',
		    count : 0
		}, default_options, options);
		this.init();
	}
	
	DataTmpl.prototype.init = function() {
		
		var elems = {
		    targets : {},
		    empties : {},
		    toggles : {}
		};
		
		$(this.element).data('DataTmpl', this);
		
		$(this.element).find('[data-tmpl-gen]').remove();
		
		$(this.element).find('[data-tmpl]').addClass('tmpl_disabled').each(function() {
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
			if (!elems[k][kn]) {
				elems[k][kn] = [];
			}
			elems[k][kn].push(obj);
		});
		
		$.each(elems, function(k1, v) {
			$.each(v, function(k2, v) {
				elems[k1][k2] = $(v);
			});
		});
		
		this.targets = elems;
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
	
	DataTmpl.prototype.fillElement = function(target, v) {
		var oldcontext = target.data('context');
		if (oldcontext) {
			if (oldcontext == v) {
				return false;
			} else if ($.toJSON(oldcontext) == $.toJSON(v)) {
				// object equal
				return false;
			}
		} else {
			target.data('context', v);
			// console.log(target[0], $.data(target[0], 'context'));
		}
		
		var tag = target[0].nodeName;
		var t = $.typeOf(v);
		var _v = v;
		
		switch (t) {
		case 'array':
			throw 'DataTmpl.fillElement:invalid value (array)';
		case 'date':
			// _v = { '@as_html':true, '@text':v.toLocaleString() };
			_v = {
			    '@as_html' : true,
			    '@text' : $.dateformat(v, this.options.dateformat)
			};
			break;
		case 'number':
			if (this.options.number_comma) {
				v = $.numformat.comma3(v);
			}
		case 'string':
			switch (tag) {
			case 'A':
				if (target.text() != '' || target.children().length > 0) {
					_v = {
					    '@as_html' : true,
					    'href' : v
					};
				} else {
					_v = {
					    '@as_html' : true,
					    '@text' : v,
					    'href' : v
					};
				}
				break;
			case 'IMG':
				_v = {
				    '@as_html' : true,
				    'src' : v
				};
				break;
			case 'INPUT':
				switch (target.attr('type') || '') {
				/*
				 * case 'radio': if (target.val() === _v) { _v = {
				 * '@as_html':true, 'selected':'selected' }; } else { _v = {
				 * '@as_html':true, 'selected':'' }; } break; case 'checkbox':
				 * if (target.val() === _v) { _v = { '@as_html':true,
				 * 'checked':'checked' }; } else { _v = { '@as_html':true,
				 * 'checked':'' }; } break;
				 */
				case 'radio':
				case 'checkbox':
					_v = {
					    '@as_html' : true,
					    'value' : v
					};
					break;
				case 'button':
				case 'submit':
				case 'reset':
				case 'password':
					_v = {
						'@as_html' : true
					};
					break;
				default:
					_v = {
					    '@as_html' : true,
					    '@val' : v
					};
				}
				break;
			case 'SELECT':
			case 'TEXTAREA':
				_v = {
				    '@as_html' : true,
				    '@val' : v
				};
				break;
			default:
				_v = {
				    '@as_html' : true,
				    '@text' : v
				};
			}
		}
		var sub = _v['@as_jQuery'];
		if (sub) {
			if (sub.call) {
				sub = sub(v, context, k);
				// if (sub instanceof $.Deferred) {
				if (sub.then) { // $.Deferred
					sub.then($.closure([ target ], this, function(target, res) {
						res.removeClass('tmpl_disabled');
						target.empty().append(res).removeClass('tmpl_disabled');
					})).fail(function(ex) {
						throw ex;
					});
					return true;
				}
			}
			target.empty().append(sub).removeClass('tmpl_disabled');
			return true;
		}
		if (!('@as_html' in _v)) {
			// target.dataTmpl(_v, opts,
			// {key:kn+"."}).removeClass('tmpl_disabled');
			throw 'DataTmpl.fillElement:invalid value (object has no @as_html)';
		}
		
		for ( var kk in _v) {
			switch (kk) {
			case '@as_html':
				break;
			case '@text':
				target.text(_v[kk]);
				break;
			case '@html':
				target.html(_v[kk]);
				break;
			case '@urlize':
				target.urlize(_v[kk], this.options.urlize);
			case '@val':
				target.val(_v[kk]);
				break;
			case '@style':
				for ( var kkk in _v[kk]) {
					target.css(kkk, _v[kk][kkk]);
				}
				break;
			default:
				target.attr(kk, _v[kk]);
			}
		}
		target.removeClass('tmpl_disabled');
		
		return true;
	};
	
	DataTmpl.prototype.render = function(context) {
		
		if ($.typeOf(context) !== 'object'){
			throw new Error('DataTmpl.render():invalid context');
		}
		
		$(this.element).data('context', context);
		// console.log(this.element, $.data(this.element, 'context'));
		
		this.context = context;
		this.last_affected = $();
		
		var _thisObj = this;
		var _elem = $(this.element);
		
		if ('@self' in context) {
			this.fillElement(this.element, context['@self']);
		}
		
		for ( var k in context) {
			if (k == '@self') {
				continue;
			}
			var v = context[k];
			var kn = this.options.prefix + k;
			
			var targets = this.targets.targets[kn] || $();
			var empties = this.targets.empties[kn] || $();
			var toggles = this.targets.toggles[kn] || $();
			
			if (kn in this.options.filters) {
				v = this.options.filters[kn](v, this.options.count + 1, context);
			}
			
			var t = $.typeOf(v);
			
			if (t === 'undefined' || t === 'null') {
				t = 'boolean';
				v = false;
			}
			
			if (t === 'boolean') {
				targets.toggleClass('tmpl_disabled', !v);
				toggles.toggleClass('tmpl_disabled', !v);
				empties.toggleClass('tmpl_disabled', !!v);
				continue;
			}
			
			if (empties[0] || toggles[0]) {
				var hide = false;
				switch (t) {
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
					hide = (v === {});
					break;
				}
				empties.toggleClass('tmpl_disabled', !hide);
				toggles.toggleClass('tmpl_disabled', hide);
			}
			
			if (!targets[0]) {
				continue;
			}
			
			var _opts = this.options, _cnt = 0;
			targets.each(function() {
				switch ($.typeOf(v)) {
				case 'array':
					var target = $(this);
					var newelm, tmp = target;
					var opts = $.extend({}, _opts);
					opts.prefix = kn + ':';
					for ( var i = 0, l = v.length; i < l; i++) {
						if (i == l - 1 && v[i] === undefined) {
							break;
						} // for IE8-
						opts.count = i;
						newelm = target.clone(true).attr('data-tmpl-gen', kn).removeAttr('data-tmpl').removeClass(
						        'tmpl_disabled');
						// tmp.after(newelm.dataTmpl(v[i], opts));
						var newtmpl = new DataTmpl(newelm, opts);
						if ($.typeOf(v[i]) === 'object') {
							newtmpl.render(v[i]);
						} else {
							newtmpl.render({
								'@self' : v[i]
							});
						}
						_thisObj.last_affected = _thisObj.last_affected.add($(newelm));
						tmp.after(newelm);
						tmp = newelm;
					}
					target.attr('data-tmpl-arr', ++_cnt);
					/*
					 * if (target[0].nodeName == 'OPTION'){
					 * target.parent('select').val(''); }
					 */
					break;
				case 'object':
					if (!v['@as_html']) {
						var opts = $.extend({}, _opts);
						opts.prefix = kn + '.';
						// $(this).dataTmpl(v,
						// opts).removeClass('tmpl_disabled');
						var newtmpl = new DataTmpl(this, opts);
						newtmpl.render(v);
						_thisObj.last_affected = _thisObj.last_affected.add(newtmpl.last_affected);
						$(this).removeClass('tmpl_disabled');
						break;
					}
				default:
					if (_thisObj.fillElement($(this), v)) {
						// modified
						_thisObj.last_affected = _thisObj.last_affected.add($(this));
					}
					;
				}
			});
		}
		return _elem;
	};
	
	DataTmpl.prototype.update = function(context) {
		$(this.element).find('[data-tmpl-gen]').remove();
		this.context = $.extend(this.context, context);
		this.render(this.context);
		return this.last_affected;
	};
	
	DataTmpl.prototype.selectRows = function(key, pos, count) {
		count = count === undefined ? 1 : count;
		var target_arr = $.resolve(this.context, key);
		if ($.typeOf(target_arr) !== 'array') {
			throw new Error('DataTmpl().spliceRows():' + key + ' is not an array.');
		}
		if (pos >= target_arr.length) {
			pos = target_arr.length;
		}
		var selected = $();
		$(this.element).find('[data-tmpl="' + key + '"][data-tmpl-arr]').each(
		        function() {
			        var target = $(this);
			        
			        for ( var i = 0; i < count; i++) {
				        selected = selected.add($(this).parent().find(
				                '[data-tmpl-gen="' + key + '"]:nth-child(' + (pos + 3 + i) + ')'));
			        }
		        });
		return selected;
	},

	DataTmpl.prototype.appendRows = function(key, arr) {
		var target_arr = $.resolve(this.context, key);
		if ($.typeOf(target_arr) !== 'array') {
			throw new Error('DataTmpl().array_insert():' + key + ' is not an array.');
		}
		pos = target_arr.length;
		return this.spliceRows(key, pos, 0, arr);
	},

	DataTmpl.prototype.prependRows = function(key, arr) {
		return this.spliceRows(key, 0, 0, arr);
	}

	DataTmpl.prototype.insertRows = function(key, pos, arr) {
		return this.spliceRows(key, pos, 0, arr);
	},

	DataTmpl.prototype.deleteRows = function(key, pos, delete_count) {
		return this.spliceRows(key, pos, delete_count);
	}

	DataTmpl.prototype.spliceRows = function(key, pos, delete_count, arr) {
		/**
		 * @param key
		 *            context key string ex) 'data' means insert arr to
		 *            this.context.mean (array)
		 * @param pos
		 *            insert position (0 origin)
		 * @param arr
		 *            insert array at index <pos> of this.context[key] (array)
		 */
		var target_arr = $.resolve(this.context, key);
		if ($.typeOf(target_arr) !== 'array') {
			throw new Error('DataTmpl().spliceRows():' + key + ' is not an array.');
		}
		if (pos >= target_arr.length) {
			pos = target_arr.length;
		}
		var is_delete = true;
		delete_count = delete_count === undefined ? 1 : delete_count;
		var args = [ pos, delete_count ];
		if (arr !== undefined) {
			is_delete = false;
			args = args.concat(arr);
		}
		target_arr.splice.apply(target_arr, args);
		$.resolve(this.context, key, target_arr);
		
		var _thisObj = this;
		_thisObj.last_affected = $();
		
		$(this.element).find('[data-tmpl="' + key + '"][data-tmpl-arr]').each(
		        function() {
			        var target = $(this);
			        // var idx = $(this).attr('data-tmpl-arr');
			        
			        if (delete_count > 0) {
				        for ( var i = 0; i < delete_count; i++) {
					        $(this).parent().find('[data-tmpl-gen="' + key + '"]:nth-child(' + (pos + 3) + ')')
					                .remove();
				        }
			        }
			        
			        // remove deleted
			        var tmp = $(this).parent().find('[data-tmpl-gen="' + key + '"]:nth-child(' + (pos + 2) + ')')
			        if (pos == 0) {
				        tmp = target;
			        }
			        
			        // insert
			        if (!is_delete) {
				        var opts = {
					        prefix : key + ':'
				        };
				        for ( var i = 0, l = arr.length; i < l; i++) {
					        if (i == l - 1 && arr[i] === undefined) {
						        break;
					        } // for IE8-
					        opts.count = i + pos;
					        newelm = target.clone(true).attr('data-tmpl-gen', key).removeAttr('data-tmpl').removeClass(
					                'tmpl_disabled');
					        tmp.after(newelm.dataTmpl(arr[i], opts));
					        tmp = newelm;
					        _thisObj.last_affected = _thisObj.last_affected.add(newelm);
				        }
			        }
		        });
		return _thisObj.last_affected;
	}

	$.extend({
		DataTmpl : DataTmpl
	});
	
	$.fn.extend({
		/**
		 * dependency $.typeOf, $.dateformat (jquery-utils.js)
		 */
		
		dataTmpl : function(context, opts, _loop) {
			return this.each(function() {
				var datatmpl = new DataTmpl(this, opts);
				return datatmpl.render(context, _loop);
			});
		}
	
	});
	
})(jQuery);
