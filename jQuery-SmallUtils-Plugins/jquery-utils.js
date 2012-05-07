/*
 * jQury URLize plugin
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
 * var clusure = $.closure([arg1,arg2,...],thisObj,function(_binded_arg1,_binded_arg2,..., arg1,arg2){});
 * 
 * $.doLater(function(){...},delay).then(function(){success}).fail(function(ex){...};
 * $.doLaterWith([arg1,arg2,...],thisObj,function(_arg1,_arg2,...){...},delay).then(function(){success}).fail(function(ex){...};
 * 
 * $.resolve({a:{b:"resolved a.b value"}},"a.b")
 *   -> "resolved a.b
 * 
 * $.parseISO8601('1970-01-01T00:00:00Z')
 *   -> Date(0)
 * 
 * $.dateformat(new Date(0), 'yyyy/MM/dd HH:mm')
 * 
 * $.numformat.comma3(1234.5678) -> '1,234.567'
 * 
 * $.numformat.round(12345, 3) -> 12300
 * $.numformat.round(12345.678, -1, true) -> 12345.600
 * 
 * $.numformat.kilo(1024) -> 1
 * $.numformat.mega(1024*1024) -> 1
 * 
 */
 
(function($) {
	
	$.extend({
		
		_typeOf_constructors:{
			number:(new Number()).constructor,
			string:(new String()).constructor,
			array:(new Array()).constructor,
			boolean:(new Boolean()).constructor,
			date:(new Date()).constructor,
			regexp:(new RegExp()).constructor
		},
		
		typeOf : function(v) {
			/**
			 * return better 'typeof'
			 */
			if (v === null){ return 'null';}
			var t = typeof(v);
			if (t === 'object'){
				for (var k in $._typeOf_constructors){
					if (v.constructor === $._typeOf_constructors[k]){
						return k;
					}
				}
				return 'object';
			}
			return t;
			
		},
		
		closure : function(args, thisobj, func) {
			/**
			 * make args binded closure for func.
			 * func is called with arg (args[0], args[1], ... , arguments[0], arguments[1].
			 * ex)
			 *   var f2 = $.closure([1,2], null, function(_a, _b, c) { print _a,_b,c; });
			 *   f2(3);
			 *   -> 1,2,3
			 * @param args array of binding arguments
			 * @param thisobj binding 'this' object
			 * @param func closure function
			 * @return args and 'this' binded function
			 */
			args = Array.prototype.slice.call(args);
			return function(){
				return func.apply(thisobj, args.concat(Array.prototype.slice.apply(arguments)));
			};
		},
		
		doLaterWith: function(args, thisobj, func, delay){
			/**
			 * Deferred setTimeout with closure
			 */
			delay = (delay === undefined) ? 0 : delay;
			var c = $.closure(args, thisobj, func);
			return $.Deferred(function(_d){
				setTimeout(function(){
					try {
						_d.resolve(c());
					} catch (ex) {
						_d.reject(ex);
					}
				}, delay);
			}).promise();
		},
		
		doLater : function(func, delay){
			/**
			 * Deferred setTimeout
			 */
			return $.doLaterWith([], null, func, delay);
		},
		
		resolve: function(obj, str){
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
		
			var bits = str.split('.'), bit;
			var curobj = obj;
			var curname = '';
			while(bit = bits.shift()) {
			
				if (curobj === undefined) {
					throw new Error('ResolveError: obj is undefined:<obj>'+curname);
				}
				
				curname = curname + '.' + bit;
				var res = bit.match(/^([a-zA-Z0-9_]+)(\(\))?(\[(\d+)\])?/);
				
				var name = res[1];
				var isfunc = res[2] == '()';
				var isarray = res[3] != undefined;
				var arraynum = parseInt(res[4],10);
				
				if (isfunc || isarray) {
					if (curobj[name] === undefined) {
						throw new Error('ResolveError: property is undefined:<obj>'+curname);
					}
					if (isfunc) {
						if (curobj[name].call === undefined) {
							throw new Error('ResolveError:property is not callable:<obj>'+curname);
						}
						curobj = curobj[name].call(curobj);
					} else {
						if (curobj[name] === undefined) {
							throw new Error('ResolveError:undefined property:<obj>'+curname);
						}
						curobj = curobj[name][arraynum];
					}
				} else {
					curobj = curobj[name];
				}
			}
			
			return curobj;
			
		},
		
		parseISO8601 : function(str) {
			/**
			* parse ISO8601 "YYYY-MM-DDTHH:MM:SS+TTTT" to Date().
			*/
			var p = str.match(/(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?T(\d{2})(?::(\d{2})(?::(\d{2})(?:\.(\d+))?)?)(Z|([+-]\d{2})(?::?(\d{2}))?)/);
			if (p === null) { throw new FB.Error('ISO8601ParseError', 'Invalid ISO8601 DateTime : ' + str); }
			for (var i=0; i<p.length; i++){
				switch (i) {
				case 2: case 3:
					if (p[i] === undefined) { p[i] = '01'; }; break;
				case 4: case 5: case 6: case 7: case 9: case 10:
					if (p[i] === undefined) { p[i] = '00'; }; break;
				case 8:
					if (p[i] === 'Z') { p[9] = '+00'; }; break;
				}
			}
			return new Date(
				Date.parse([p[1],p[2],p[3]].join('/')
					+' '
					+[p[4],p[5],p[6]].join(':')
					+' GMT'+[p[9],p[10]].join(''))
			);
		},
		
		dateformat : function(date, format) {
			/**
			 * yyyy,yy,MM,M,dd,d,HH,H,mm,m,ss,s,SSS
			 * hh, h, TT, tt
			 */
			function pad0(num, len){
				return ('0000'+num).split('').reverse().splice(0,len).reverse().join('');
			}
			var y=date.getFullYear(),M=date.getMonth()+1,d=date.getDate(),
					H=date.getHours(),m=date.getMinutes(),s=date.getSeconds(),S=date.getMilliseconds();
			return format
				.replace(/yyyy/g,y).replace(/yy/g,(y+'').substring(2,4))
				.replace(/MM/g,pad0(M,2)).replace(/M/g,M)
				.replace(/dd/g,pad0(d,2)).replace(/d/g,d)
				.replace(/HH/g,pad0(H,2)).replace(/H/g,H)
				.replace(/mm/,pad0(m,2)).replace(/m/,m)
				.replace(/ss/,pad0(s,2)).replace(/s/,s)
				.replace(/SSS/,pad0(S,3))
				.replace(/hh/g,pad0(H%12,2)).replace(/h/g,H%12)
				.replace(/tt/g,H<12?'am':'pm')
				.replace(/TT/g,H<12?'AM':'PM');
		},
		
		numformat : {
			comma3 : function(v){
				/**
				 * return 'comma formatted string' of number
				 */
				if (!isFinite(v) || isNaN(v)) { return v;}
				if (v<1000 && v>-1000) { return new String(v); }
				v = (new String(v)).match(/^([-+]?)(\d+)(\.\d+)?$/);
				v[2] = v[2].replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
				v[3] = v[3] === undefined ? '' : v[3];
				return v[1]+v[2]+v[3];
			},
			round: function(v, pos, pad0){
				/**
				 * return rounded number.
				 * pos = round position ( 0=1, 1=10, 2=100, -1=0.1, -2=0.01 )
				 * pad0 = padding 0 for decimal points
				 */
				pad0 = (pad0 === undefined) ? true : pad0;
				pos = (pos === undefined) ? 0 : pos;
				var ret = v;
				if (pos<0){
					ret = Math.round(v*Math.pow(10,-pos))/Math.pow(10,-pos);
				} else {
					ret = Math.round(v/Math.pow(10,pos))*Math.pow(10,pos);
				}
				if (pad0 && pos<0) {
					ret = ret.toFixed(-pos);
				}
				return ret;
			},
			kilo : function(v){
				return $.numformat.round(v/1024,-2,false);
			},
			mega : function(v){
				return $.numformat.round(v/1024/1024,-2,false);
			}
		}
		
	});
		

})(jQuery);
