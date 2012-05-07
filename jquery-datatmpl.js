
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
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 *********************************************************************
 * 
 * This plugin maps variables in JSON context to text/html/attributes of HTLM elements.
 * $(target).dataTmpl(contextObj, option)
 * 
 * Target)
 * context.VARNAME mapped to <target>...<elem data-tmpl="VARNAME"></elem>...</target> .
 * context.VARNAME.CHILDNAME mapped to <target>...<elem data-tmpl="VARNAME.CHILDNANME"></elem>...</target>.
 * context ARRAY[x].CHILDAME mapped to <target>...<elem data-tmpl="VARNAME:CHILDNAME"></elem>...</target> and iterate array elements.
 * 
 * Extract)
 * context.VARNAME is string or number:
 *   <elem data-tmpl="VARNAME">${context.VARNAME|html escaped}</elem>
 * context.VARNAME is Date:
 *   <elem data-tmpl="VARNAME">${context.VARNAME|dateformatted string yyyy/MM/dd HH:mm:ss}</elem>
 * context.VARNAME is string and target is <a> and <a> is empty:
 *   <a href="${context.VARNAME}" target="_blank">${context.VARNAME|escaped}</a>
 * context.VARNAME is string and target is <a> and <a> is not empty:
 *   <a href="${context.VARNAME}" target="_blank">Default Static String</a>
 * context.VARNAME is string and target is <img>:
 *   <img src="${context.VARNAME}">
 * context.VARNAME is Object:
 *   when context.VARNAME has "@as_html",
 *     vars extracted to element attributes without below:
 *     "@text" extracted as text content of element,
 *     "@html" extracted as HTML content of element.
 *         <elem ${key1}=${value1} ${key2}=${value2}>${@text or @html}</elem>
 *     "@style" set "style" attributes (CSS) by object.
 *         "@style":{'font-size':'large', 'color':'#ccc' }
 *   when context VARNAME don't have "@as_html":
 *     extract as child dataTmpl
 *         <elem><child-taget>...</child-target></elem>
 * 
 * Switches)
 * data-tmpl="!context.VARNAME" 
 *   enabled when context.VARNAME == false,[],{},0 or Inf or NaN,empty string(space chars only),null,undefined
 * data-tmpl="?context.VARNAME" 
 *   enabled when context.VARNAME == true,[not empty],{not empty},not 0
 * 
 * Options)
 *   target: "target" attribute of <a>
 *   datetimeformat: "datetime format - $.datetimeformat at jquery-utils.js" for Date
 *   number_comma: format Number to comma separated (default true).
 *   filters:{} filter functions hash.
 *     'context.VARNAME':function(var, array_loop_counter1, context){ return [new value]; }
 * 
 * Restriction)
 *   arrays cannot contain non object values.
 *       BAD:  context.ARRAY = [1,2,3,...]
 *       GOOD: context.ARRAY = [ {data:1}, {data:2}, {data:3}, ...]
 *   elements for children must be in elements for parent.
 *       BAD:  <elem data-tmpl="context.OTHER1"></elem>
 *             <elem data-tmpl="context.VARNAME.CHILDNAME"></elem>
 *             <elem data-tmpl="context.OTHER2"></elem>
 *       GOOD: <elem data-tmpl="context.OTHER1"></elem>
 *             <elem data-tmpl="context.VARNAME>
 *               <elem data-tmpl="context.VARNAME.CHILDNAME"></elem>
 *             </elem>
 *             <elem data-tmpl="context.OTHER2"></elem>
 * 
 * Example)
 * <div id="bookmarks" class="loading">
 *   <p>Link target is <a data-tmpl="link_url"></a></p>
 *   <img data-tmpl="photo_link_url" witdh="100" height="100">
 *   <div data-tmpl="?bookmarks" class="bookmarks">
 *     <div data-tmpl="bookmarks">
 *       <span data-tmpl="bookmarks:memo">bookmarks[].memo placeholder</span>
 *       <span data-tmpl="bookmarks:time">bookmarks[].time placeholder</span>
 *       <a data-tmpl="bookmarks:link"></a>
 *     <div>
 *     <div data-tmpl="paging">
 *       <a href="paging.prev_url" target="_self">Prev</a>
 *       <a href="paging.next_url" target="_self">Next</a>
 *     </div>
 *   </div>
 *   <div data-tmpl="!bookmarks" class="no_bookmarks">
 *     No Bookmarks.
 *   </div>
 * </div>
 * <script>
 * $(function(){
 * context = {
 *   link_url:'http://link.to/path',
 *   photo_link_url:'http://link.to/img.gif'
 *   bookmarks:[
 *     { memo:'memo1', time:Date(....), link:{'@as_html':true, href:'http://link.to.bookmark/1', '@text':'bookmark1' }},
 *     { memo:'memo2', time:Date(....), link:{'@as_html':true, href:'http://link.to.bookmark/1', '@text':'bookmark2' }},
 *   ],
 *   paging = {
 *   	prev:'?p=1', next:'?p=3', cur:''
 *   }
 * };
 * $('#bookmarks').dataTmpl(context).removeClass('loading');
 * });
 * </script>
 */

(function($){
	
	$('<style>.tmpl_disabled { display:none!important; }</style>').appendTo('head');
	
	var default_options = {
		dateformat:'yyyy/MM/dd HH:mm:ss',
		number_comma:true,
		urlize:{
			linebreaksbr:true,
			trunc:[25, 20, false],
			target:'_blank'
		},
		filters:{}
	};
	
	function DataTmpl(element, options){
		this.element = element;
		this.options = $.extend({prefix:'',count:0}, default_options, options);
		this.init();
	}
	
	DataTmpl.prototype.init = function(){
		
		var elems = {
			targets:{},
			empties:{},
			toggles:{}
		};
	
		$(this.element).find('[data-tmpl-gen]').remove();
		
		$(this.element).find('[data-tmpl]')
			.addClass('tmpl_disabled')
			.each(function(){
				var obj = $(this);
				var kn = obj.attr('data-tmpl'),f=kn.substring(0,1);
				var k = 'targets';
				if (f == '!') {
					k = 'empties'; kn = kn.substring(1);
				} else if (f == '?') {
					k = 'toggles'; kn = kn.substring(1);
				}
				if (!elems[k][kn]) {
					elems[k][kn] = [];
				}
				elems[k][kn].push(obj);
			});
		
		$.each(elems, function(k1,v){
			$.each(v, function(k2,v){
				elems[k1][k2] = $(v);
			});
		});
		
		this.targets = elems;
	};
	
	DataTmpl.prototype.filter_functions = {
		datetime:function(format){
			return function(v){
				return $.datetimeformat(v, format || this.options.datetimeformat);
			};
		},
		num_comma3:function(){
			return function(v){
				return $.number.comma3(v);
			};
		},
		num_round:function(pos,pad0){
			return function(v) {
				return $.number.round(pos,pad0);
			};
		}
	};
	
	DataTmpl.prototype.fillElement = function(target, v){
		
		var tag = target[0].tagName.toLowerCase();
		var t = $.typeOf(v);
		var _v = v;
		
		switch (t) {
		case 'array':
			throw 'DataTmpl.fillElement:invalid value (array)';
		case 'date':
			// _v = { '@as_html':true, '@text':v.toLocaleString() };
			_v = { '@as_html':true, '@text':$.dateformat(v, this.options.dateformat) };
			break;
		case 'number':
			if (this.options.number_comma) {
				v = $.numformat.comma3(v);
			}
		case 'string':
			switch (tag) {
				case 'a':
					if (target.text() != '' || target.children().length > 0) {
						_v = { '@as_html':true, 'href':v };
					} else {
						_v = { '@as_html':true, '@text':v, 'href':v };
					}
					break;
				case 'img':
					_v = { '@as_html':true, 'src':v };
					break;
				case 'input':
					switch (target.attr('type') || '') {
					case 'radio':
						if (target.val() === _v) {
							_v = { '@as_html':true, 'selected':'selected' };
						} else {
							_v = { '@as_html':true, 'selected':'' };
						}
						break;
					case 'checkbox':
						if (target.val() === _v) {
							_v = { '@as_html':true, 'checked':'checked' };
						} else {
							_v = { '@as_html':true, 'checked':'' };
						}
						break;
					case 'button': case 'submit': case 'reset': case 'password':
						_v = { '@as_html':true };
						break;
					default:
						_v = { '@as_html':true, '@val':v };
					}
					break;
				case 'select':
				case 'textarea':
					_v = { '@as_html':true, '@val':v };
					break;
				default:
					_v = { '@as_html':true, '@text':v };
			}
		}
		var sub = _v['@as_jQuery'];
		if (sub) {
			if (sub.call) {
				sub = sub(v, context, k);
				// if (sub instanceof $.Deferred) {
				if (sub.then) { // $.Deferred
					sub.then($.closure([target],this,function(target, res){
						res.removeClass('tmpl_disabled');
						target.empty()
							.append(res)
							.removeClass('tmpl_disabled');
					})).fail(function(ex){
						throw ex;
					});
					return;
				}
			}
			target.empty().append(sub).removeClass('tmpl_disabled');
			return;
		}
		if (!('@as_html' in _v)) {
			// target.dataTmpl(_v, opts, {key:kn+"."}).removeClass('tmpl_disabled');
			throw 'DataTmpl.fillElement:invalid value (object has no @as_html)';
		}
		
		for (var kk in _v) {
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
				for (var kkk in _v[kk]) {
					target.css(kkk, _v[kk][kkk]);
				}
				break;
			default:
				target.attr(kk, _v[kk]);
			}
		}
		target.removeClass('tmpl_disabled');
		
	};
	
	DataTmpl.prototype.update = function(context){
		$(this.element).find('[data-tmpl-gen]').remove();
		this.context = $.extend(this.context, context);
		this.render(this.context);
	};
	
	DataTmpl.prototype.render = function(context){
		
		this.context = context;
		
		var _thisObj = this;
		var _elem = $(this.element);
		
		for (var k in context) {
			var v = context[k];
			var kn = this.options.prefix + k;
			
			var targets = this.targets.targets[kn]||$();
			var empties = this.targets.empties[kn]||$();
			var toggles = this.targets.toggles[kn]||$();
			
			
			if ( kn in this.options.filters ) {
				v = this.options.filters[kn](v, this.options.count+1, context);
			}
			
			var t = $.typeOf(v);
			
			if (t === 'undefined' || t === 'null'){
				t = 'boolean';
				v = false;
			}
			
			if (t === 'boolean') {
				targets.toggleClass('tmpl_disabled', !v);
				toggles.toggleClass('tmpl_disabled', !v);
				empties.toggleClass('tmpl_disabled', !!v);
				continue;
			}
			
			if (empties[0] || toggles[0]){
				var hide = false;
				switch (t) {
				case 'array':
					hide = (v.length === 0);
					break;
				case 'string': 
					hide = !!(v.match(/^\s*$/));
					break;
				case 'number':
					hide = (v === 0 
							|| isNaN(v) 
							|| v === Number.POSITIVE_INFINITY 
							|| v === Number.NEGATIVE_INFINITY);
					break;
				case 'object':
					hide = ( v === {} );
					break;
				}
				empties.toggleClass('tmpl_disabled', !hide);
				toggles.toggleClass('tmpl_disabled', hide);
			}
			
			if (!targets[0]) { continue; }
			
			var _opts = this.options;
			targets.each(function(){
				// toggles.removeClass('tmpl_disabled');
				switch ($.typeOf(v)) {
				case 'array':
					var target = $(this), newelm, tmp=target;
					var opts = $.extend({},_opts);
					opts.prefix = kn+':';
					for (var i=0,l=v.length;i<l;i++){
						opts.count = i;
						newelm = target.clone(true)
							.attr('data-tmpl-gen',1)
							.removeClass('tmpl_disabled');
						tmp.after(newelm.dataTmpl(v[i], opts));
						tmp = newelm;
					}
					break;
				case 'object':
					if (!v['@as_html']){
						var opts = $.extend({},_opts);
						opts.prefix = kn+'.';
						$(this).dataTmpl(v, opts);
						break;
					}
				default:
					_thisObj.fillElement($(this), v);
				}
			});
		}
		return _elem;
	};
	
	$.extend({
		DataTmpl:DataTmpl
	});
	
	$.fn.extend({
		/**
		 * dependency $.typeOf, $.dateformat (jquery-utils.js)
		 */
		
		dataTmpl : function(context, opts, _loop) {
			return this.each(function(){
				return (new DataTmpl(this, opts).render(context, _loop));
			});
		}
	
	});
	
})(jQuery);
