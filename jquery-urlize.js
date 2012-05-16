(function($) {
	
	var tmpdiv = $('<div>');
	function toHtml(text){ return tmpdiv.text(text).html(); }
	function toText(html){ return tmpdiv.html(html).text(); }
	
	$.extend({
		urlize : function(text, opts){
			/**
			 * convert text to html : convert URL to <a> and linbreaks to <br>.
			 * opts : {
			 *    linebreaksbr:<true|false> // convert linebreaks to <br>
			 *    trunc:[<head_len>, <tail_len>, <trunc_protocol(bool)>] // truncate URL as "http://www.exam....ndex.html"
			 *    target:<link 'target'>.
			 *    twitter:<true|false> // urlize @xxx, #xxx for Twitter
			 * }
			 */
			opts = $.extend({
				linebreaksbr:true,
				trunc:[25, 20, false],
				target:'_blank',
				twitter:false
			}, opts);
			var target = opts.target ? ' target="'+opts.target+'"' : '';
			var html = toHtml(text);
			html = opts.linebreaksbr ? html.replace(/(\r\n|\r|\n)/g,'<br>') : html;
			// html = html.replace(/\b((https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
			html = html.replace(/(^|<br>|\s|\uFF03)(@([a-zA-Z0-9_]+)|#([a-zA-Z0-9_\u3041-\u3094\u309D-\u309E\u30A1-\u30FA\u30FC-\u30FE\u3400-\uD7FF\uFF10-\uFF19\uFF20-\uFF3A\uFF41-\uFF5A\uFF66-\uFF9E]+)|(https?|ftp|file):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#\/%=~_|])/mg,
				function(all, pre, match, match2){
					var html = match, h = html.substring(0,1);
					if (h === '@' || h === '#'){
						if (opts.twitter){
							if (h === '@') {
								return pre+'<a href="https://twitter.com/'+match2+'"'+target+'>'+html+'</a>';
							}
							return pre+'<a href="https://twitter.com/#!/search/realtime/'+encodeURIComponent(html)+'"'+target+'>'+html+'</a>';
						} else { return all; }
						return match;
					}
					if (opts.trunc){
						var h = opts.trunc[0], t = opts.trunc[1], trunc_protocol=opts.trunc[2];
						if (trunc_protocol) {
							html = html.replace(/^(https?|ftp|file):\/\//,'');
						}
						var text = toText(html);
						if (text.length >= h + t + 3) {
							text = text.substring(0, h) + '...'+text.substring(text.length-t, text.length);
							html = toHtml(text);
						}
					}
					return pre+'<a href="'+match+'"'+target+'>'+html+'</a>';
				}
			);
			return html;
		}
		
	});
		
	
	$.fn.extend({
		urlize : function(text, opts){
			return $(this).html($.urlize(text, opts));
		}
	});

})(jQuery);
