<?php

require('lib/settings.php');
require('lib/utils.php');

define('Y_APP_ID' , 'x0B8xG2xg67HLDmGgF5z73x3MefGkMK6X5cnNorhiJjpFNLhNOdY_k_eQ4gWZvOob7bp');


function res_log($obj) {
	// return;
	global $res;
	array_push($res['log'], $obj);
}

class Cache {

	private $db;
	private $disabled;

	public function __construct($enable=TRUE){

		$db = null;

		$path = (realpath(dirname(__FILE__).'/lib/getrelatedlinks.sqlite3.db'));

		if (!$db = new PDO('sqlite:'.$path)){
			throw new Exception('Cannot connect Database');
		}
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		$this->disabled = !$enable;
		$this->db = $db;
	}

	public function __destruct() {
		unset($this->db);
	}

	public function get($url){

		if ($this->disabled){
			return FALSE;
		}

		$db = $this->db;

		$stmt = $db->prepare('SELECT json from related_links where url=?');
		if ($stmt->execute(array($url))){
			$res = $stmt->fetch();
			if ($res){
				return json_decode($res[0], true);
			}
		}
		return FALSE;
	}

	public function set($url, $title, $query, $json){
		/* when nocache, update entries
		 if ($this->disabled){
		return TRUE;
		}*/

		$db = $this->db;

		res_log('set');

		$db->beginTransaction();

		res_log('update related_links table');
		$stmt = $db->prepare('INSERT OR REPLACE INTO related_links (url, title, query, json) VALUES (?, ?, ?, ?)');
		if (!$stmt->execute(array($url, $title, $query, json_encode($json)))){
			res_log('failed.');
			$db->rollback();
			return FALSE;
		}
		$db->commit();
		res_log('success.');
		return TRUE;
	}

}

function curl_get($url, $params = null, $reget_remain = 10, &$redirects = array()) {

	if ($reget_remain <= 0) {
		throw new Exception('too many redirects.');
	}

	res_log('curl:'.$url);

	if ($params) {
		if (strpos($url, '?') == false) {
			$url .= '?';
		}
		foreach ($params as $k => $v) {
			$url .= '&'.urlencode($k).'='.urlencode($v);
		}
	}

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_TIMEOUT, 20);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
	curl_setopt($ch, CURLOPT_USERAGENT, USER_AGENT);
	curl_setopt($ch, CURLOPT_ENCODING, ''); // Accept-Encoding

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
	curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);

	curl_setopt($ch, CURLOPT_MAXREDIRS, 1);

	//curl_setopt($ch, CURLOPT_NOBODY, TRUE);
	//curl_setopt($ch, CURLOPT_HEADER, TRUE);

	$body = curl_exec($ch);
	$info = curl_getinfo($ch);

	if (empty($info['http_code'])){
		throw new Exception('No HTTP code was returned.');
	}

	$http_code = $info['http_code'];
	$url = $info['url'];
	
	if ($http_code == 503) {
		res_log('busy? '.$http_code.' '.$url);
		sleep(3);
		res_log('retry '.$http_code.' '.$url);
		return curl_get($url, $params, $reget_remain - 1, $redirects);
	}
	
	if ($http_code == 301 || $http_code == 302) {
		array_push($redirects, $url);
		res_log('redirect '.$http_code.' '.$url);
		return curl_get($url, $params, $reget_remain - 1, $redirects);
	}

	$res['url'] = $url;
	$res['http_code'] = $http_code;
	$res['content_type'] = $info['content_type'];

	//$res['info'] = $info;
	res_log($info);

	if ($http_code != 200) {
		throw new Exception('cURL Error:HTTP '.$res['http_code'].':'.$url);
	}

	if (preg_match('@^text/x?html(?:;\s*charset=(.*))?$@',$info['content_type'], $match)) {

		$detect_order = 'ASCII,JIS,UTF-8,EUC-JP,SJIS';

		$http_charset = '';
		if (count($match)==2){
			$http_charset = $match[1];
			$detect_order = $http_charset.','.$detect_order;
		}

		res_log('HTTP charset:'.$http_charset.' / detect '.$detect_order);

		//res_log($body);

		$body = mb_convert_encoding($body, 'UTF-8', $detect_order);

		// res_log($body);

		$baseurl = parse_url($res['url']);
		$basepath = preg_replace('@/[^/]*$@', '/', $baseurl['path']);

		if (preg_match('@<meta\\s+http-equiv=["\']refresh["\']\\s+content=["\']\\d+;\\s*url=([^"\']+)["\']@mi', $body, $match)) {
			// header('Location: getredirect.php?callback='.$callback.'_u='.$match[1]);
			$url =  html_entity_decode($match[1],null,'UTF-8');
			if (!preg_match('@^https?:@', $url)){
				if (substr($url, 0, 1) == '/') {
					$url = $baseurl['scheme'].'://'.$baseurl['host'].$url;
				} else {
					$url = $baseurl['scheme'].'://'.$baseurl['host'].$basepath.$url;
				}
			}
			array_push($redirects, $url);
			res_log('redirect meta refresh : '.$url);
			return curl_get($url, $params, $reget_remain - 1, $redirects);

		}

	}

	array_push($redirects, $url);

	return $body;

}

try {

	if (empty($_REQUEST['_u'])) {
		throw new Exception('Bad Parameter');
	}

	$url = $_REQUEST['_u'];
	$title = empty($_REQUEST['_t'])? null : $_REQUEST['_t'];
	$additional_query = empty($_REQUEST['_q']) ? '' : $_REQUEST['_q'];
	$callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : null;
	$expire_sec = isset($_REQUEST['expire_sec']) ? $_REQUEST['expire_sec'] : 60*60*7;
	$use_cache =  ! isset($_REQUEST['nocache']);
	$use_log = isset($_REQEUST['log']);

	$URL_REGEX = '/^(https?|ftp|file):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#\/%=~_|]$/';

	if (!preg_match($URL_REGEX, $url)){
		throw new Exception('Bad parameter : url');
	}

	$redirects = array();
	$res = array('log'=>array($_REQUEST), 'redirects'=>&$redirects);

	$cache = new Cache($use_cache);
	if ($cached = $cache->get($url)){
		unset($cached['log']);
		$cached['cached'] = TRUE;
		$res = $cached;
	} else {

		if (!$title) {

			$body = curl_get($url, 10 , $redirects);

			// title
			if (preg_match('@<title(?:\\s[^>]*)?>([^<]*)</title>@si', $body, $matches)){
				$res['title'] = html_entity_decode($matches[1], ENT_QUOTES, 'UTF-8');
			}

			// desc
			if (preg_match('@<meta\\s+name="description"\\s+content="([^"]+)"\\s*/?>@si', $body, $matches)){
				$res['description'] = html_entity_decode($matches[1], ENT_QUOTES, 'UTF-8');
			}

			// OpenGraphProtocol
			$og = array();
			if (preg_match_all('@<meta\\s+property="og:([^"]+)"\\s+content="([^"]+)"(?:\\s*)/?>@si', $body, $matches)){
				// ogp : title, type, url, image, image:type, image:width, image:height, description
				for ($i=0; $i<count($matches[0]); $i++) {
					$og[$matches[1][$i]] = html_entity_decode($matches[2][$i], ENT_QUOTES, 'UTF-8');
				}
			}
			if ($og) {
				$res['og'] = $og;
			}

		}


		$phrase = json_decode(curl_get('http://jlp.yahooapis.jp/KeyphraseService/V1/extract', array(
			'appid' => Y_APP_ID,
			'sentence' => $title,
			'output' => 'json'
		)), true);

		$phrase = array_flip($phrase);
		krsort($phrase, SORT_NUMERIC);
		
		unset($phrase['100']);

		$query = join(' ', array_slice(array_values($phrase), 0, 3));

		$excludes = array_map(function($v){
			return preg_replace('@^https?://@', '', $v);
		}, array_merge($redirects, array($url, 'ranking','新着','最新')));

		$query .= ' -'.join(' -', $excludes).' '.$additional_query;

		$res['query'] = $query;

		res_log($query);

		$links_xml = curl_get('http://search.yahooapis.jp/WebSearchService/V2/webSearch', array(
			'appid' => Y_APP_ID,
			'format' => 'html',
			'results' => 5,
			'query' => $query
		));

		$links = json_decode(json_encode(simplexml_load_string($links_xml), true));

		$res['links'] = $links;
		
		$json = $res;
		unset($json['log']);

		$cache->set($url, $title, $query, $json);

	}

	//$res['url'] = $info['url'];

} catch (Exception $ex) {
	$exception = array('systemerror'=>array(
		'message' => $ex->getMessage(),
		'code' => $ex->getCode(),
		'line' => $ex->getLine(),
	));
	if (isset($res)){
		$exception['res'] = $res;
	}
	$res = $exception;
	$expire_sec = 0;
}

if ($callback){
	jsonp_response($res, $callback, $expire_sec);
} else{
	json_response($res, $expire_sec);
}
