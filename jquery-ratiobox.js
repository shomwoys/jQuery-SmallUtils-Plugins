/*
 * jQury ratiobox plugin
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
 */

(function($) {

	$.fn.extend({
		ratiobox : function(){
			/**
			 * returns ratio box wrapped img/iframe with attribute width, height.
			 */
			return this.each(function(){
				var $elm = $(this);
				var h = $elm.attr('height'), w = $elm.attr('width');
				if (! (h && w)) {
					return;
				}
				var r = h/w * 100;
				var disp = $elm.css('display'), vert = $elm.css('vertical-align');
				
				var $spacer = $('<div></div>').css({
					'padding-top': r+'%',
					'position':'relative',
					'height': 0
				});
				var $wrapper = $('<div class="ratio-wrap"></div>').css({
					'display': (disp == 'inline') ? 'inline-block' : disp,
					'vertical-align': vert,
					'position':'relative',
					'max-width': '100%',
					'width': w + 'px'
				}).append($spacer);
				
				$elm.after($wrapper);
				$wrapper.append($elm);
				
				$elm.removeAttr('height').removeAttr('width').css({
					'width': '100%',
					'height': 'auto',
					'position': 'absolute',
					'top':0,
					'left':0,
					'width': '100%',
					'height': '100%',
					'display': 'block',
					'margin': 0,
				}).addClass('ratio-wrapped');
				
				
			});
		}
	});
	
})(jQuery);
