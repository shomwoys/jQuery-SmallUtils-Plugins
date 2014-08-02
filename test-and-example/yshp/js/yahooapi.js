/**
 * usage:
 * 
 * $(function(){
 * 
 * $.FB.load({init options}, locale).then( $.FB. );
 */

(function($) {
	
	/*
	 * shopping.yahooapis.jp/ShippingWebService/V1/...
	 * 		itemSearch
	 * 			query/jan/isbn/category_id/product_id/person_id/brand_id/store_id to products informations
	 * 		categoryRanking
	 * 			categoryId to products infomations
	 * 		categorySearch
	 * 			catetgory_id to category
	 * 		itemLookup
	 * 			itemcode to infomations
	 * 		queryRanking
	 * 			type(ranking/up) to query
	 * 		:
	 * 		eventSearch
	 * 			event_type(all/point/season/special/store) to events informations
	 * 		:
	 * 		reviewSearch
	 * 			jan/category_id/product_id/person_id store_id to review/products informations
	 */

	var YSHP_ENDPOINT = 'http://shopping.yahooapis.jp/ShoppingWebService/V1/json/';
	var yjdn_options = {};
	
	function regulateShoppingResult(res) {
		var result = {};
		var items = [];
		$.each(res.ResultSet, function(k, v) {
			if (isNaN(parseInt(k,10))) {
				result[k] = v;
			}
		});
		$.each(res.ResultSet[0].Result, function(k, v) {
			if (isNaN(parseInt(k,10))) {
				result[k] = v;
			} else {
				items.push(v);
			}
		});
		result.Items = items;
		return result;
	}
	
	$.extend({
		YJDN : {
			init : function(params) {
				yjdn_options = $.extend({}, params);
				if (!params.appid) {
					throw new Error('appid is not set.');
				}
			},
			api : function(type, params) {
				params = $.extend(yjdn_options, params);
				return $.Deferred(function(_d) {
					$.ajax({
						url : YSHP_ENDPOINT + type + '?callback=?',
						type : 'GET',
						data : params,
						dataType : 'jsonp'
					}).done(function(res) {
						if (res.Error) {
							_d.reject(res);
						} else {
							// Shopig API results regulate
							var res2 = regulateShoppingResult(res);
							_d.resolve(res2);
						}
						//_d.resolve(res);
					}).fail(function(xhr, textStatus, errorThrown) {
						_d.reject({
							'Error' : {
								Message : 'HTTP Error : ' + textStatus
							}
						});
					});
				}).promise();
			}
		}
	});
	
})(jQuery);