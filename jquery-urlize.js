(function($) {
	
	$.extend({
		
		urlize : function(text, opts){
			/**
			 * convert text to html : convert URL to <a> and linbreaks to <br>.
			 * opts : {
			 *    linebreaksbr:<true|false> // convert linebreaks to <br>
			 *    trunc:[<head_len>, <tail_len>, <trunc_protocol(bool)>] // truncate URL as "http://www.exam....ndex.html"
			 *    target:<link 'target'>
			 * }
			 */
			opts = $.extend({
				linebreaksbr:true,
				trunc:[25, 20, false],
				target:'_blank'
			}, opts);
			var target = opts.target ? ' target="'+opts.target+'"' : '';
			var html = $('<div style="white-space:pre">').text(text).html();
			html = opts.linebreaksbr ? html.replace(/(\r\n|\r|\n)/g,'<br>') : html;
			html = html.replace(/\b((https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
				function(match, pos, all){
					var text = match;
					if (opts.trunc){
						var h = opts.trunc[0], t = opts.trunc[1], trunc_protocol=opts.trunc[2];
						if (trunc_protocol) {
							text = text.replace(/^(https?|ftp|file):\/\//,'');
						}
						if (text.length >= h + t + 3) {
							text = text.substring(0, h) + '...'+text.substring(text.length-t, text.length);
						}
					}
					return '<a href="'+match+'"'+target+'>'+text+'</a>';
				}
			);
			return html;
		}
		
	});
		
	
	$.fn.extend({
		urlize : function(text, opts){
			return $(this).html($.urlize(text, opts));
		},
	});

})(jQuery);
