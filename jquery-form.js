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

(function($) {
	
	$.extend({
		MAIL_RX : /^([a-zA-Z0-9])+([a-zA-Z0-9\._+-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/,
		URL_RX : /^(https?|ftp|file):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#\/%=~_|]$/,
		DATE_RX : /^(\d{4})[-\/](1[012]|0?[1-9])[-\/](3[01]|[12][0-9]|0?[1-9])$/,
		TIME_RX : /^(2[0-4]|[01]?[0-9]):([0-5][0-9])(?::([0-5][0-9]))?$/,
		DATETIME_RX : /^(\d{4})[-\/](1[012]|0?[1-9])[-\/](3[01]|[12][0-9]|0?[1-9])\s+(2[0-4]|[01]?[0-9]):([0-5][0-9])(?::([0-5][0-9]))?$/
	});
	
	/* support placeholder for not-supported browsers */
	
	var PLACEHOLDER_TARGET = ':input[placeholder]:not([type="checkbox"],[type="radio"])';
	
	var has_placeholder = 'placeholder' in document.createElement('input') && 'placeholder' in document.createElement('textarea');
	
	if (has_placeholder) {
		$.fn.setPlaceholder = function(){ return this; };
		$.fn.cleanPlaceholder = function(){ return this; };
	} else {
		(function(){
			var org_val = $.fn.val;
			$.fn.setPlaceholder = function(){
				this.filter(PLACEHOLDER_TARGET).filter(':not(.placeholder)').each(function(){
					var $this = $(this), v = org_val.call($this);
					if (v === undefined || v === '') {
						if ($this.attr('type') == 'password') {
							var $dummy;
							if ($.browser.msie && parseInt($.browser.version) < 9) {
								var text = $this.outerHTML()
									.replace(/type=["']?password["']?/,'type="text"');
								$dummy = $(text);
							} else {
								$dummy = $(this).clone().attr('type', 'text');
							}
							$dummy.addClass('placeholder-dummy').removeAttr('name')
								.focus(function(){
									$(this).hide().prev().show().focus();
									$(this).remove();
								});
							$this.after($dummy.setPlaceholder()).hide();
						} else {
							org_val.call($this, $this.attr('placeholder'));
						}
						$this.addClass('placeholder');
					}
					if ($this.is(':focus')) {
						$this.trigger('focus');
					}
				});
				return this;
			};
			$.fn.cleanPlaceholder = function(){
				this.filter(PLACEHOLDER_TARGET).filter('.placeholder').removeClass('placeholder').each(function(){
					org_val.call($(this), '');
				});
				return this;
			};
			$.fn.val = function(v){
				if (!arguments.length) {
					if (this.filter(PLACEHOLDER_TARGET).hasClass('placeholder')) {
						return '';
					}
					return org_val.call(this);
				}
				if (this.hasClass('placeholder-dummy')) {
					org_val.call(this.prev().cleanPlaceholder(), v).setPlaceholder();
				}
				return org_val.call(this, v).removeClass('placeholder').setPlaceholder();
			};
		})();
		
		$(document).on('submit', 'form', function(ev){
			$(ev.currentTarget).find(PLACEHOLDER_TARGET).cleanPlaceholder();
		}).on('reset', 'form', function(ev){
			var $targets = $(ev.currentTarget).find(PLACEHOLDER_TARGET).cleanPlaceholder();
			setTimeout(function(){
				$targets.setPlaceholder();
			});
		});
		
		$(document).on('focus keyup change', PLACEHOLDER_TARGET, function(ev){
			$(ev.currentTarget).cleanPlaceholder();
		}).on('blur', PLACEHOLDER_TARGET, function(ev){
			$(ev.currentTarget).setPlaceholder();
		});
		
		$(document).ready(function(){
			$(PLACEHOLDER_TARGET).setPlaceholder();
		});
		$(window).on('beforeunload', function(){
			$(PLACEHOLDER_TARGET).cleanPlaceholder();
		});
		
	}

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
			if ($(this).get(0).nodeName !== "FORM") {
				throw 'formGet: target is not <form>';
				return $(this);
			}
			/*
			if ($(this).hasClass('locked')) {
				'console' in window && console.error('WARN: formGet() cannot get values from fomrLock()ed form');
			}*/
			var is_locking = $(this).formIsLocking();
			if (is_locking) {
				$(this).formUnlock();
			}
			if (!has_placeholder){
				$(this).filter(PLACEHOLDER_TARGET).cleanPlaceholder();
			}
			var ret = {};
			$($(this).serializeArray()).each(function(i, v) {
				if (ret[v.name] !== undefined) {
					if (!ret[v.name].push) {
						ret[v.name] = [ ret[v.name] ];
					}
					ret[v.name].push(v.value || '');
				} else {
					ret[v.name] = v.value;
				}
			});
			if (!has_placeholder){
				$(this).filter(PLACEHOLDER_TARGET).setPlaceholder();
			}
			if (is_locking) {
				$(this).formLock();
			}
			return ret;
		},

		formSet : function(obj, doClear, clearFields) {
			/**
			 *  @param obj : json object (from formGet)
			 *  @param doClear : clear form before set : default true
			 *  @param clearFields : clera hidden input when clear form : default false
			 */
			if (this[0] && this[0].nodeName !== "FORM") {
				throw 'formSet: target is not <form>';
				return this;
			}
			if (doClear === undefined || doClear) {
				this.formClear(clearFields);
			}
			var is_locking = this.formIsLocking();
			this.formUnlock();
			var form = this;
			$.each(obj, function(k, v) {
				form.find('[data-form-name="' + k + '"]').each(function(){
					if ($(this).is('img')) {
						$(this).attr('src', v);
					} else if ($(this).is('a')) {
							$(this).attr('href', v);
					} else {
						$(this).text(v);
					}
				});
				form.find(':input[name="' + k + '"]').each(function() {
					var t = this.type, ov = null, changed = false, $this = $(this);
					if (t === undefined) {
						t = 'text';
					}
					switch (t) {
					case 'button':
					case 'submit':
					case 'reset':
						break;
					case 'checkbox':
						ov = this.checked;
						function check_or_uncheck($input, v){
							var checked = false;
							if ($input.is('[value]')){
								checked = $input.attr('value') == v;
							} else {
								checked = (v == true || v == 'on' || v == 'true');
							}
							$input[0].checked = checked;
							return checked;
						}
						if (v instanceof Array) {
							var cb = $(this).val(), i, l = v.length;
							this.checked = false;
							for (i = 0; i < l; i++) {
								if (check_or_uncheck($this, v[i])) {
									break;
								}
							}
						} else {
							check_or_uncheck($this, v);
						}
						changed = ov != this.checked;
						break;
					case 'radio':
						ov = this.checked;
						this.checked = ($this.val() == v);
						changed = ov != this.checked;
						break;
					default:
						ov = $this.val();
						$this.val(v);
						changed = ov != v;
					}
					if (changed) {
						$this.change();
					}
				});
			});
			if (!has_placeholder){
				$(this).filter(PLACEHOLDER_TARGET).setPlaceholder();
			}
			if (is_locking) {
				this.formLock();
			}
			return this;
		},

		formClear : function(clearFields) {
			/**
			 * clear form inputs.
			 * $('form').formClear();
			 *   clear all fields without type="hidden"
			 * $('form').formClear(true);
			 *   clear all fields
			 * $('form').formClear(['name1','name2',...]);
			 *   clear 'name1', 'name2', ... fields (include hidden)
			 */
			if (this[0] && this[0].nodeName !== "FORM") {
				throw 'serializeObject: target is not <form>';
				return $(this);
			}
			/*
			if (!has_placeholder){
				$(this).filter(PLACEHOLDER_TARGET).cleanPlaceholder();
			}
			*/
			var clearHidden = false;
			if (clearFields) {
				clearHidden = true;
			}
			if ($.type(clearFields) != 'array') {
				clearFields = null;
			}
			this.find(':input').each(function() {
				if (clearFields && $.inArray(this.name, clearFields) < 0){
					return;
				}
				switch (this.type) {
				case 'button':
				case 'submit':
				case 'reset':
					break;
				case 'checkbox':
				case 'radio':
					this.checked = false;
					$(this).syncLabel();
					break;
				case 'hidden':
					if (clearHidden)
						$(this).val('');
					break;
				default:
					$(this).val('');
					break;
				}
			});
			return $(this);
		},
		
		formErrors : function(errors, opts) {
			/**
			 * <form>
			 * 	<input name="xxx"><span class="error_msg" data-for="xxx"></span>
			 * </form>
			 * 
			 * $('form').formErrors({
			 *    xxx : 'error message'
			 * });
			 * 
			 */
			var form = this;
			if (form[0].nodeName != 'FORM') {
				return $(this);
			}
			opts = $.extend({
				error_class : 'error_msg'
			}, opts);
			// form.find('.' + opts.error_class + '[data-for]').text('').css('display', 'none');
			form.find('.' + opts.error_class + '[data-for]').text('').removeClass('has_error').addClass('no_error').hide();
			$.each(errors || {}, function(k, v) {
				// form.find('.' + opts.error_class + '[data-for="' + k + '"]').text(v).css('display', 'block');
				form.find('.' + opts.error_class + '[data-for="' + k + '"]').text(v).addClass('has_error').removeClass('no_error').show();
			});
			return this;
		},
		
		formErrorsClear : function(opts) {
			var form = this;
			if (form[0].nodeName != 'FORM') {
				return $(this);
			}
			opts = $.extend({
				error_class : 'error_msg'
			}, opts);
			form.find('.' + opts.error_class + '[data-for]').text('').css('display', 'none');
			return this;
		},
		
		formLock : function(maskopts){
			var form = this;
			if (form[0].nodeName != 'FORM') {
				return $(this);
			}
			form.mask(maskopts).data('formLocked', true);
			form.find((':input,a')).attr('disabled', 'disabled').addClass('locked');
			return form;
		},
		
		formUnlock : function(){
			var form = this;
			if (form[0].nodeName != 'FORM') {
				return $(this);
			}
			form.find((':input,a')).removeAttr('disabled').removeClass('locked');
			form.mask('destroy').removeData('formLocked');
			return form;
		},
		
		formIsLocking : function(){
			var form = this;
			if (form[0].nodeName != 'FORM') {
				return null;
			}
			return !!form.data('formLocked');
		},
		
		formValidate : function(validators){
			/**
\			 * @param validators {
			 *   '<name>' : [ <require num>, <regexp|function(v){ return false if error }>, '<error message>', '<require message>'],
			 *   :
			 *   '@all' : function(data){ return { <errors> } or undefined }, // optional
			 *   '@required_message': 'required message' // optional
			 * }
			 * @return { <cleaned data> } or { '_has_error':true, '<name>': '<errormessage>', ..., '@all': '<errormessage>' }
			 */
			validators = $.extend({}, validators);
			var form = this;
			var data = form.formGet();
			var errors = {};
			var required_message = validators['@required_message'];
			$.each(validators, function(k, v) {
				if (k[0] != '@') {
					var required = v[0], validator = v[1], message = v[2];
					required_message = v[3] || required_message || 'required';
					if (data[k] == '') {
						if (required > 0) {
							errors[k] = required_message;
							return;
						}
					}
					if (required == 0 && ( data[k] === '' || data[k] === undefined )) {
						delete data[k];
						return;
					}
					if (!$.isArray(data[k])) {
						if ((validator.test && !validator.test(data[k])) || (validator.call && validator(data[k]) === false)) {
							errors[k] = v[2];
						}
					} else {
						$.each(data[k], function(i, d){
							if ((validator.test && !validator.test(d)) || (validator.call && validator(d) === false)) {
								errors[k] = v[2];
							}
						});
					}
				}
			});

			if ($.isEmptyObject(errors)) {
				if (validators['@all']) {
					errors = validators['@all'](data) || {};
				}
			}
			return $.isEmptyObject(errors) ? data : $.extend({ '_has_error': true }, errors);
		},
		
		formPost : function(opts) {
			/**
			 * POST form by ajax ($.Deferred).
			 * 
			 * When form is submitted:
			 *   1. preprocess:
			 *       i)   add 'posting' class to <form>
			 *       ii)  disabled :inputs
			 *       iii) clear '.error_msg' texts and set display:none;
			 *   2. POST values to <url>
			 *   3. process response.
			 *        res.errors is exists
			 *          i)  set error texts to data-for="<param_name>"
			 *          ii) reject(res)
			 *        res.success == true
			 *          resolve(res)
			 *   4. postproces
			 *       i)   wait 1500ms ( to avoid muitiple post )
			 *       ii)  enable :inputs
			 *       iii) remove 'posting' class from <form>
			 * 
			 * usage)
			 * 
			 * <script>
			 * $(function(){
			 *   $(form).submit(function(){
			 *     $(this).formPost()
			 *     .done(function(res){
			 *        location.href="success.html";
			 *     }).fail(function(res){
			 *        if (res.systemerror) { alert(res.systemerror); }
			 *        if (res.ajaxerror) { alert(ajaxerror.responseText); }
			 *     });
			 *     return false;
			 *   }).find('.error_msg[data-for]').css('display','none');
			 * </script>
			 * <form id="testform" method="post" action="/path/to/post.json">
			 *    <span class="error_msg" data-for="@all"></span>
			 *
			 *    <input type="text" name="param1">
			 *    <span class="error_msg" data-for="param1"></span>
			 *    <input type="text" name="param2">
			 *    <span class="error_msg" data-for="param2"></span>
			 *                     :
			 *    <input type="sbumit">
			 * </form>
			 * 
			 * expected /path/to/post.json response:
			 * 
			 * {
			 *    success:true, // when sucess
			 *    errors:{ // when validation error
			 *        '<param_name>':'<error message>', 	// validation error for param_name
			 *        '<param_name>':'<error message>', 	// validation error for param_name
			 *                       :
			 *        '@all':'<error message>'				// relational error
			 *    },
			 *    systemerror:'<system error message>'		// system error (ex: generic exceptions)
			 * }
			 * 
			 * options)
			 *     $(form).fomrPost({
			 *         error_class:'<error message class - defalt:error_msg>'
			 *     })
			 * 
			*/

			if ($(this).get(0).nodeName !== "FORM") {
				throw 'serializeObject: target is not <form>';
				return $(this);
			}

			var form = $(this);
			if (!has_placeholder) {
				$(this).filter(PLACEHOLDER_TARGET).cleanPlaceholder();
			}

			opts = $.extend({
				url : $(form).attr('action'),
				error_class : 'error_msg',
				posting_class : 'posting',
				method: 'post',
				validators : { // regexp checker : { '<param>' : [ /<regexp>/, '<error message>'], ..., '@all':function(data){ return <true if relational validation is ok> } }
					'@all' : function(data) {
						return true;
					}
				},
				clean : function(params) { // check params : if return errors object, caccel and proc errors.
					return params;
				},
				filter : function(res) { // filter for server respose
					return res;
				},
				beforeSend : function(xhr, settings) {
					if (!/https?:.*/.test(settings.url)) {
						xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
					}
				}
			}, opts);

			var url = opts.url;

			if (url === undefined) {
				alert('params.url or form[action] is nothing.');
			}

			function afterProc(func, delay) {
				delay = delay === undefined ? 250 : delay;
				setTimeout(function() {
					form.removeClass(opts.posting_class);
					form.formUnlock();
					func();
				}, delay);
			}
			
			return $.Deferred(function(_d) {
				var _d2 = $.Deferred();
				try {
					form.addClass(opts.posting_class);
					form.formErrors();
					var data = form.formValidate(opts.validators);
					if (data._has_error) {
						form.formErrors(data, {
							error_class: opts.error_class
						});
						afterProc(function(){
							_d.resolve({
								errors : data
							});
						});
						return;
					}
					
					form.formLock();

					data = opts.clean(data);

					data[new Date().getTime()] = '';

					_d2 = $.ajax({
						'cache' : false,
						'url' : url,
						'type' : opts.method.toUpperCase(),
						'data' : data,
						'dataType' : 'json'
					}).then(function(res) {
						res = opts.filter(res);
						if (res.success) {
							afterProc(function(){
								_d.resolve(res);
							});
							return;
						}
						if (res.systemerror) {
							afterProc(function(){
								_d.reject(res);
							});
							return;
						}
						if (res.errors) {
							form.formErrors(res.errors, {
								error_class: opts.error_class
							});
							afterProc(function(){
								_d.reject(res);
							});
						} else {
							afterProc(function(){
								_d.reject(res);
							});
						}
					}).fail(function(xhr, textStatus, errorThrown) {
						afterProc(function(){
							_d.reject({
								'ajaxerror' : xhr
							});
						});
					});
				} catch (ex) {
					afterProc(function(){
						_d.reject({
							'systemerror' : ex
						});
					});
					setTimeout(function() {
						throw ex;
					}, 500);
				}
				_d.abort = function() {
					_d2.abort && _d2.abort();
					_d.resolve('aborted');
				};
			}).promise();
		},
		
		formClearDirty : function(data){
			$(this).find('form').add($(this).filter('form')).each(function(){
				var $form = $(this);
				$form.data('dirty_org', data || $form.formGet());
			});
			return this;
			// console.log('formClearDirty:' + $.toJSON($this.data('dirty_org')));
		},
		
		formIsDirty : function(){
			/* return true if any of $(form) is dirty */
			var is_dirty = false;
			$(this).find('form').add($(this).filter('form')).each(function(){
				var $form = $(this);
				// console.log('formIsDirty:\n' + $.toJSON($form.formGet()) + '\n' + $.toJSON($form.data('dirty_org')));
				is_dirty = $.toJSON($form.formGet()) != $.toJSON($form.data('dirty_org'));
			});
			return is_dirty;
		},
		
		setBusy : function(){
			$(this).addClass('busy').attr('disable', 'disable');
		},
		
		unsetBusy : function(){
			$(this).removeClass('busy').attr('disable', '');
		},
		
		findLabel : function(){
			var label_id = $('label[for="' + this.attr('id') + '"]');
			return label_id[0] ? label_id : this.closest('label');
		},
		
		syncLabel : function(options){
			var opts = $.extend({
				className : 'checked'
			}, this.data('syncLabel'), options);
			this.data('syncLabel', opts);
			var input = this;
			if (input.attr('type') != 'radio' && input.attr('type') != 'checkbox') {
				return this;
			}
			switch (input.attr('type').toLowerCase()) {
			case 'checkbox':
				var checked = input[0].checked;
				input.findLabel().toggleClass(opts.className, checked).toggleClass('not' + opts.className, !checked);
				break;
			case 'radio':
				input.closest('form').find(':input[name="'+input.attr('name')+'"]').each(function(){
					var checked = this.checked;
					$(this).findLabel().toggleClass(opts.className, checked).toggleClass('not' + opts.className, !checked);
				});
				break;
			}
			return this;
		},
		
		syncLabels : function(options){
			var opts = $.extend({
				className : 'checked'
			}, this.data('syncLabels'), options);
			this.data('syncLabels', opts);
			var form = this;
			form.find('input[type="checkbox"],input[type="radio"]').each(function(){ $(this).syncLabel(opts); });
			return this;
		},
		
		formPreventAutoSubmit : function() {
			$(this).find('input:not([type]),input[type="text"],input[type="url"],input[type="date"]').on('keypress', function(ev){
				if (ev.which ==  13) {
					ev.preventDefault();
				}
			});
		}
		
	});
	
	function _blockEvent(ev){
		ev.stopPropagation();
		ev.preventDefault();
		return false;
	};
	
	$.extend({
		formLocalSupported: function(){
			return !!(window.localStorage && window.JSON && window.JSON.stringify);
		}
	});
	
	if (window.localStorage && window.JSON && window.JSON.stringify) {
		// save / restore / delete to localStorage
		$.fn.extend({
			formLocalSave : function(key, filter_func){
				// do not save if filter_func returns false
				filter_func = filter_func || function(v) { return v; }
				var v = filter_func($(this).formGet());
				if (v) {
					v._saved_at = new Date().getTime();
					localStorage.setItem(key, JSON.stringify(v));
				}
				return this;
			},
			formLocalRestore : function(key, filter_func){
				// do not restore if filter_func returns false
				filter_func = filter_func || function(v) { return v; }
				var v = $.formLocalData(key);
				if (v) {
					v = filter_func(v);
					if (v) {
						delete v._saved_at;
						$(this).formSet(v);
					}
				}
				return this;
			},
		});
		$.extend({
			formLocalHasKey: function(key){
				return !!(localStorage.getItem(key));
			},
			formLocalData : function(key){
				var v = localStorage.getItem(key);
				if (v) {
					v = JSON.parse(v);
					if (v) {
						// delete v._saved_at;
						return v;
					}
				}
				return null;
			},
			formLocalDelete : function(key){
				localStorage.removeItem(key);
				return this;
			},
			formLocalExpire: function(expire_date){
				// clean all saved form data before expire_date
				// default expire date is before 7 days.
				expire_date = expire_date || new Date(new Date() - 7 * 24 * 60 * 60 * 1000);
				$.each(localStorage, function(i){
					var k = localStorage.key(i), v = localStorage.getItem(k);
					if (v._saved_at < expire_date) {
						localStorage.removeItem(k);
					}
				});
			}
		});
	}
	
	$(document)
		.on('click', 'a.busy, :input.busy, button.busy', _blockEvent)
		.on('keydown', ':input.busy', _blockEvent)
		.on('submit', 'form.busy', _blockEvent)
		.on('dblclick', 'input[type="button"],input[type="submit"],input[type="reset"]', _blockEvent);
	
	/* sync input[type="radio"] and input[type="checkbox"] and labels */
	
	$(document).on('change', 'form input[type="checkbox"],form input[type="radio"]', function(ev){
		$(ev.currentTarget).syncLabel();
	});
	
	if ($.browser.msie) {
		if (parseInt($.browser.version) < 9) {
			$(document).on('click', 'label img', function(ev){
				var $this = $(ev.currentTarget), $label = $this.closest('label');
				$('#' + $label.attr('for')).add($label.find('input')).click();
			});
		}
		if (parseInt($.browser.version) < 7) {
			var _cnt = 0;
			$('label:not([for]) input[type="radio"], label:not([for]) input[type="checkbox"]').each(function(){
				var $input = $(this), id = $input.attr('id') || 'input_cbr' + (_cnt++);
				$input.closest('label:not([for])').attr('for', id);
			});
		}
		/*
		$(document).on('click', 'form label:not([for])', function(ev){
			var $label = $(ev.currentTarget), $input = $('#' + $label.attr('for')).add($label.find('input:radio,input:checkbox'));
			if ($input[0]) {
				var checked = $input[0].checked;
				if ($input.attr('type') == 'radio') {
					$input.attr('checked', true).focus().trigger('click');
				} else {
					$input.attr('checked', !checked).focus().trigger('click');
				}
			}
			ev.stopPropagation();
			ev.preventDefault();
		});
		*/
	}
	
	$(document).on('focus', 'input[type="text"],input[type="password"],input[type="url"],input[type="email"],input[type="date"],input[type="time"]',function(){
		this.select();
	});
	
	$(document).on('blur', 'input[type="url"]',function(){
		var v = $(this).val();
		if (v && !v.match(/^(https?:)/)) {
			$(this).val('http://' + v);
		}
	});
	
	$.setStyle('form .error_msg.no_error { display: none! important }');
	
	$(document).on('focus', ':input[id]', function(){
		var $label = $('label[for="' + $(this).attr('id') + '"]');
		$label.addClass('focused');
	}).on('blur', ':input[id]', function(){
		var $label = $('label[for="' + $(this).attr('id') + '"]');
		$label.removeClass('focused');
	});
	
})(jQuery);
