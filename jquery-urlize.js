(function($) {
	
	var tmpdiv = $('<div>');
	function toHtml(text){ return tmpdiv.text(text).html(); }
	function toText(html){ return tmpdiv.html(html).text(); }
	function outerHTML(jq){ return $('<div>').append(jq.clone()).html(); }
	
	var UNI_NONSPACE = '\u0100-\u1FFF\u200B-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uFFFD';
	
	// var URLIZE_RX = /\b((https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	// var URLIZE_RX = /(^\\.?|<br>|\s|\uFF03|^[a-zA-Z0-9]|)(@([a-zA-Z0-9_]+)|#([a-zA-Z0-9_\u3041-\u3094\u309D-\u309E\u30A1-\u30FA\u30FC-\u30FE\u3400-\uD7FF\uFF10-\uFF19\uFF20-\uFF3A\uFF41-\uFF5A\uFF66-\uFF9E]+)|(https?|ftp|file):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#\/%=~_|])/mg;
	var URLIZE_RX = new RegExp([
	    '(^\\.?|<br>|\s|\uFF03|^a-zA-Z0-9|)',
	    '(',
	        '@([a-zA-Z0-9_]+)|',
	        '#([a-zA-Z0-9_\u3041-\u3094\u309D-\u309E\u30A1-\u30FA\u30FC-\u30FE\u3400-\uD7FF\uFF10-\uFF19\uFF20-\uFF3A\uFF41-\uFF5A\uFF66-\uFF9E]+)|',
	        '(https?|ftp|file):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#\/%=~_|'+ UNI_NONSPACE +']*',
	    ')'
	].join(''), 'mg');
	
	$.extend({
		urlize : function(text, opts){
			/**
			 * convert text to html : convert URL to <a> and linbreaks to <br> or <p>.
			 * opts : {
			 *   // convert_linebreaks to <br> or <p>
			 *   linebreaksbr: 'br'|'p'|true|false, // true = 'br'
			 *   // truncate URL as "http://www.exam....ndex.html"
			 *   trunc:[<head_len>, <tail_len>, <trunc_protocol : true|false>] ,
			 *   target: '<link "target">',
			 *   // return attr hash for <a> 
			 *   twitter:{
			 *     mention : function(mention){
			 *         // return attr 'hash' for <a>
			 *         return { href:'<link>', ... }
			 *     }, 
			 *     hash : function(hash){
			 *       // return attr hash for <a>
			 *       return { href:'<link>',...}
			 *     }
			 *   }
			 */
			opts = $.extend({
				urlize:true,
				linebreaksbr:'br',
				trunc:[25, 20, false],
				target:'_blank',
				twitter:{
					mention:function(screen_name){
						return 'https://twitter.com/'+screen_name;
					},
					hash:function(hash, elem){
						// return 'https://twitter.com/#!/search/realtime/'+encodeURIComponent(hash);
						return 'https://twitter.com/search?q='+encodeURIComponent(hash);
					}
				}
			}, opts);
			var target = opts.target ? ' target="'+opts.target+'"' : '';
			var html = toHtml(text);
			// html = opts.linebreaksbr ? html.replace(/(\r\n|\r|\n)/g,'<br>') : html;
			var br = opts.linebreaksbr;
			if (br) {
				br = br === true ? 'br' : br;
				br = br === 'p' ? '/p><p' : br;
				html = html.split(/(\r\n|\r|\n)+/).join('<'+ br +'>');
				if (br == '/p><p') {
					html = '<p>' + html + '</p>';
				}
			}
			if (!opts.urlize) {
				return html;
			}
			// html = html.replace(,
			html = html.replace(URLIZE_RX,
				function(all, pre, match, match2){
					var html = match, h = html.substring(0,1);
					if (h === '@' || h === '#'){
						if (opts.twitter){
							if (h === '@') {
								// return pre+'<a href="https://twitter.com/'+match2+'"'+target+'>'+html+'</a>';
								if (opts.twitter.mention) {
									var ret = opts.twitter.mention(match2);
									if ($.type(ret) == 'string'){
										ret = { href:ret };
									}
									var elem = $('<a'+target+'>');
									for (var k in ret){
										elem.attr(k, ret[k]);
									}
									elem.text('@' + match2);
									return pre+outerHTML(elem);
								}
							} else {
								if (opts.twitter.hash) {
									var ret = opts.twitter.hash(match);
									if ($.type(ret) == 'string'){
										ret = { href:ret };
									}
									var elem = $('<a'+target+'>');
									for (var k in ret){
										elem.attr(k, ret[k]);
									}
									elem.text(match);
									return pre+outerHTML(elem);
								}
							}
							// return pre+'<a href="https://twitter.com/#!/search/realtime/'+encodeURIComponent(html)+'"'+target+'>'+html+'</a>';
						} else {
							return all;
						}
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
			return $('<div>').html(html).html();
		}
		
	});
		
	
	$.fn.extend({
		urlize : function(text, opts){
			return $(this).html($.urlize(text, opts));
		}
	});

})(jQuery);
