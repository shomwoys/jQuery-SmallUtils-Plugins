/*
 * jQury form helper plugin
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
 * $(form).formGet()
 * get form :input values as object (hash)
 * 
 * HTML:
 * <form>
 *   <input name="a" value="1">
 *   <input type="checkbox" name="cb" value="cb1" checked="checked">
 *   <input type="checkbox" name="cb" value="cb2">
 *   <input type="checkbox" name="cb" value="cb3" checked="checked">
 * </form>
 * 
 * script:
 * $(form).fromGet()
 *   -> { a:"1", cb:["cb1","cb3"] }
 * 
 **********
 * $(form).formSet(obj)
 * set form :input values with object (hash)
 * 
 * HTML:
 * <form>
 *   <input name="a" value="1">
 *   <input type="checkbox" name="cb" value="cb1" checked="checked">
 *   <input type="checkbox" name="cb" value="cb2">
 *   <input type="checkbox" name="cb" value="cb3" checked="checked">
 * </form>
 * 
 * script:
 * $(form).formSet({
 *   a:"2",
 *   cb:["cb2", "cb3"]
 * })
 * 
 * *********
 * $.formPost($(form))
 * set submit() for <form>: Ajax post and set error reasons.
 * 
 * HTML:
 * <form method="post" action="path/to/json_api/to/post">
 *   <span class="error error_@all">error placeholder for all</span>
 *   <input name="p1"><span class="error error_p1">error placeholder for p1</span>
 *   <input name="p2"><span class="error error_p2">error placeholder for p2</span>
 *   <input type="submit">
 * </form>
 * 
 * script:
 * $(function(){
 *   $("form").submit(function(){
 *     $(this).formPost()
 *     .then(function(){
 *       alert('success');
 *       location.href="success.html"
 *     }).fail(function(res){
 *       if (res.ajaxerror){ alert('connection error:'+res.ajaxerror.statusText) }
 *       if (res.systemerror) { alert('serverside error:'+res.systemerror); }
 *     });
 *     return false;
 *   });
 * });
 * 
 * expected server response:
 * { success:true; }
 * or
 * { errors:{ '<field name>':'<error message>', ... }
 * or
 * { systemerror:'system error message' }
 * 
 */

(function($){
	
	$.fn.extend({
		
		formGet : function() {
			/**
			 * serialize form to Object.
			 * $('form').serializeObject() returns
			 * { <name1>:<value1_1>,
			 *   <name2>:[ <value2_1>, <value2_2>, ...],
			 *    :
			 *  }
			 */
			if ($(this).get(0).tagName.toUpperCase() !== "FORM") {
				throw 'formGet: target is not <form>';
				return $(this);
			}
			var ret = {};
			$($(this).serializeArray()).each(function(i,v){
				if (ret[v.name] !== undefined) {
					if (!ret[v.name].push) {
						ret[v.name] = [ret[v.name]];
					}
					ret[v.name].push(v.value || '');
				} else {
					ret[v.name] = v.value;
				}
			});
			return ret;
		},
		
		formSet : function(obj, doClear, clearHidden){
			/**
			 * de-serialize Object to form.
			 * $('form').deserializeObject(
			 * { <name1>:<value1_1>,
			 *   <name2>:[ <value2_1>, <value2_2>, ...],
			 *    :
			 *  });
			 *  @param obj : json object (from formGet)
			 *  @param doClear : clear form before set : default true
			 *  @param clearHidden : clera hidden input when clear form : default false
			 */
			if ($(this).get(0).tagName.toUpperCase() !== "FORM") {
				throw 'fromSet: target is not <form>';
				return $(this);
			}
			if (doClear === undefined || doClear) $(this).formClear(clearHidden);
			var form = $(this);
			$.each(obj, function(k,v){
				form.find(':input[name="'+k+'"]').each(function(){
					var t = this.type;
					if (t === undefined) { t = 'text'; }
					switch (t){
					case 'button': case 'submit': case 'reset':
						break;
					case 'checkbox':
						if (v instanceof Array){
							var cb = $(this).val(),i,l=v.length;
							this.checked = false;
							for (i=0;i<l;i++){
								if (cb == v[i]){
									this.checked = true;
									break;
								}
							}
						} else {
							this.checked = $(this).attr('value') == v;
						}
						break;
					case 'radio':
						this.checked = ($(this).val() == v);
						break;
					default:
						$(this).val(v);
					}
				});
			});
			return $(this);
		},
		
		formClear : function(clearHidden){
			/**
			 * de-serialize Object to form.
			 * $('form').deserializeObject(
			 * { <name1>:<value1_1>,
			 *   <name2>:[ <value2_1>, <value2_2>, ...],
			 *    :
			 *  });
			 */
			if ($(this).get(0).tagName.toUpperCase() !== "FORM") {
				throw 'serializeObject: target is not <form>';
				return $(this);
			}
			$(this).find(':input[name]').each(function(){
				switch(this.type){
				case 'button': case 'submit': case 'reset':
					break;
				case 'checkbox': case 'radio':
					this.checked = false;
					break;
				case 'hidden':
					if (clearHidden) $(this).val('');
					break;
				default:
					$(this).val('');
				break;
				}
			});
			return $(this);
		},
		
		formPost : function(elm, url) {
			/**
			 * POST form by ajax ($.Deferred).
			 * 
			 * When form is submitted:
			 *   1. add 'posting' class to <form>, disabled inputs, clear '.error' texts and set display:none;
			 *   2. POST values to <url>
			 *   3. process res.
			 *        res.errors
			 *          - set error texts to '.error_<param_name>', reject(res)
			 *        res.success 
			 *          - resolve(res)
			 *   4. wait 1500ms ( to avoid muitiple post ) and enable inputs and remove 'posting' class
			 * 
			 * usage)
			 * 
			 * <script>
			 * $(function(){
			 *   $(form)submit(function(){
			 *     $(this).formPost()
			 *     .done(function(res){
			 *        location.href="success.html";
			 *     }).fail(function(res){
			 *        if (res.systemerror) { alert(res.systemerror); }
			 *        if (res.ajaxerror) { alert(ajaxerror.responseText); }
			 *     });
			 *     return false;
			 *   });
			 * </script>
			 * <form id="testform" method="post" action="/path/to/post.json">
			 *    <span class="error error_@all"></span>
			 *
			 *    <input type="text" name="param1">
			 *    <span class="error error_param1"></span>
			 *    <input type="text" name="param2">
			 *    <span class="error error_param2"></span>
			 *                     :
			 *    <input type="sbumit">
			 * </form>
			 * 
			 * /path/to/post.json is expected to return json string below:
			 * {
			 *    success:true, // if true
			 *    errors:{
			 *        '<param_name>':'<error message>', 	// validation error for param_name
			 *        '<param_name>':'<error message>', 	// validation error for param_name
			 *                       :
			 *        '@all':'<error message>'				// relational error
			 *    },
			 *    systemerror:'system error message'		// system error (ex: generic exceptions)
			 * }
			 * 
			*/
			
			if ($(this).get(0).tagName.toUpperCase() !== "FORM") {
				throw 'serializeObject: target is not <form>';
				return $(this);
			}
			
			var form = $(this);
			
			if (url === undefined) {
				url = form.attr('action');
			}
			
			return $.Deferred(function(_d){
				try {
					form.find('.error').css('display:none');
					var data = form.formGet();
					data[new Date().getTime()]='';
					form.addClass('posting');
					form.find((':input')).attr('disabled','disabled');
					form.find('.error').css('display','none').text('');
					$.ajax({
						'url':url,
						'type':'POST',
						'data':data,
						'dataType':'json',
						'error':function(xhr, textStatus, errorThrown){
							_d.reject({
								ajaxerror:xhr
							});
						}
					}).then(function(res){
						if (res.success) {
							_d.resolve(res);
							return;
						}
						if (res.systemerror) {
							_d.reject(res);
							return;
						}
						if (res.errors) {
							for (var k in res.errors) {
								form.find('.error_'+k)
									.text(res.errors[k])
									.css('display','');
							}
							_d.reject(res);
						} else {
							_d.reject(res);
						}
					}).fail(function(xhr){
						_d.reject({'ajaxerror':xhr});
					}).always(function(){
						form.removeClass('posting');
						setTimeout(function(){
							form.find(':input').removeAttr('disabled');
						}, 1500);
					});
				} catch (ex) {
					_d.reject({'systemerror':ex});
					setTimeout(function(){ throw ex; },100);
				}
			}).promise();
		}
	});

})(jQuery);
