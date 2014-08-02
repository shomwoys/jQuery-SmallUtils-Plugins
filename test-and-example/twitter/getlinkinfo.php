<?php

require('lib/settings.php');
require('lib/utils.php');

function res_log($obj) {
	// return;
	global $res;
	array_push($res['log'], $obj);
}

function array_remove_dupl(&$array, $val){
	for ($i=0; $i<count($array); $i++){
		// res_log('array_remove_dupl:'.$array[$i].'==='.$val);
		if ($array[$i] === $val) {
			return array_splice($array, $i, 1);
		}
	}
	return FALSE;
}

function extract_string($str, $min_len = 3){
	/**
	 * extract "words" array in $str.
	 * "word" is
	 * 	1. length > $min_len
	 *  2. without marks
	 *  3. sequence of same kind characters (lowercase, UPPERCASE, Camelcase, degits)
	 */
	$cnt = 0;
	$bits = array();
	$bit = '';
	$ot = 0;
	foreach(str_split($str) as $chr){
		$c = ord($chr);
		if ($c < 48){          // !"#4%&'()*+,-./
			$t = 0;
		} else if ($c < 58) { // 0-9
			$t = 1;
		} else if ($c < 65) { // :;<=>?@
			$t = 0;
		} else if ($c < 91) { // A-Z
			$t = 2;
		} else if ($c < 97) { // [\]^_`
			$t = 0;
		} else if ($c < 123) { // a-z)
			$t = 3;
		}  else {               // {|}~
			$t = 0;
		}
		if ($ot != $t && !($ot == 2 && $t == 3 /* dont split camel case */)) {
			if ($ot != 0) {
				if ($cnt >= $min_len){
					array_push($bits, $bit);
				} else {
					// discard short
				}
			} else {
				// discard marks
			}
			$cnt = 0;
			$bit = '';
		}
		$ot = $t;
		$bit = $bit.$chr;
		$cnt++;
	}
	if (strlen($bit) >= $min_len) {
		array_push($bits, $bit);
	}
	return $bits;
}

function cmp_domain($a, $b){
	// ドメイン部分一致ポイント算出
	// 右から.区切りで2文字は1pt、それ以上は2ptとして算出。
	// 3pt以上ならたぶん同じドメイン。(xxx.com, xxx.ne.jp, xxx.jpなど)
	$point = 0;
	$a = explode('.', $a);
	$b = explode('.', $b);
	while (true){
		$a0 = array_pop($a);
		$b0 = array_pop($b);
		if ($a0 === null || $b0 == null || $a0 != $b0){
			return $point;
		}
		$point += (strlen($a0)>2) ? 2 : 1;
	}
}

class Cache {

	private $db;
	private $disabled;

	public function __construct($enable=TRUE){

		$db = null;

		$path = (realpath(dirname(__FILE__).'/lib/getlinkinfo.sqlite3.db'));

		if (!$db = new PDO('sqlite:'.$path)){
			throw new Exception('Cannot connect Database');
		}
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		/*
		 $db->query(
		 		'CREATE TABLE IF NOT EXISTS redirects ('
		 				+ 'src            TEXT UNIQUE NOT NULL, '
		 				+ 'dst_id         INTEGER NOT NULL, '
		 				+ 'created_at_utc TIMESTAMP DEFAULT CURRENT_TIMESTAMP '
		 				+')');

		$db->query('CREATE TABLE IF NOT EXISTS info ('
				+ 'dst_id         INTEGER PRIMARY KEY AUTOINCREMENT, '
				+ 'url            TEXT NOT NULL UNIQUE, '
				+ 'json           TEXT NOT NULL, '
				+ 'created_at_utc TIMESTAMP DEFAULT CURRENT_TIMESTAMP '
				+')');

		$db->query('CREATE INDEX IF NOT EXISTS idx_src on tbl(redirects)');
		*/

		$this->disabled = !$enable;
		$this->db = $db;
	}

	public function __destruct() {
		unset($this->db);
	}

	public function clear($url){

		if ($this->disabled){
			return;
		}

		$db = $this->db;

		$db->beginTransaction();

		try {
			$stmt = $db->prepare('SELECT dst_id FROM info WHERE url=?');
			$res = $stmt->execute(array($url));
			if (FALSE !== ( $dst_id = $res->fetch() ) ) {
				$stmt = $db->prepare('DELETE FROM redirects WHERE dst_id=? ');
				$stmt->execute($dst_id);
				$stmt = $db->prepare('DELETE FROM info WHERE dst_id=?');
				$stmt->execute($dst_id);
			}
		} catch (Exception $ex) {
			$db->rollBack();
			throw $ex;
		}

		$db->commit();
	}

	public function get_src($src_url){

		if ($this->disabled){
			return FALSE;
		}

		$db = $this->db;

		$stmt = $db->prepare('SELECT dst_id from redirects where src=?');
		if ($stmt->execute(array($src_url))){
			$res = $stmt->fetch();
			if ($res){
				return $this->get_dst_by_id($res[0]);
			}
		}
		return FALSE;
	}

	public function get_dst_by_id($dst_id){
		if ($this->disabled){
			return FALSE;
		}

		$db = $this->db;

		$stmt = $db->prepare('SELECT json from info where dst_id=?');
		if ($stmt->execute(array($dst_id))){
			$res = $stmt->fetch();
			if ($res){
				return json_decode($res[0], true);
			}
		}
		return FALSE;
	}

	public function get_dst($dst_url){
		if ($this->disabled){
			return FALSE;
		}

		$db = $this->db;

		$stmt = $db->prepare('SELECT json from info where url=?');
		if ($stmt->execute(array($dst_url))){
			$res = $stmt->fetch();
			if ($res){
				return json_decode($res[0], true);
			}
		}
		return FALSE;
	}

	public function set_info($res){
		/* when nocache, update entries
		 if ($this->disabled){
		return TRUE;
		}*/

		$db = $this->db;

		res_log('set_info');

		$db->beginTransaction();

		res_log('update info table');
		$json = $res;
		unset($json['log']);
		unset($json['redirects']);
		unset($json['http_code']);
		unset($json['required_url']);
		$stmt = $db->prepare('INSERT OR REPLACE INTO info (url, json) VALUES (?, ?)');
		if ($stmt->execute(array($res['url'], json_encode($json)))){
			$dst_id = $db->lastInsertId('info');
			res_log(' dst_id : '.$dst_id.' : '.$res['url']);
		}

		res_log('update redirects table');
		$urls = array_merge($res['redirects'],array($res['required_url'],$res['url']));
		$stmt = $db->prepare('INSERT OR REPLACE INTO redirects (src, dst_id) VALUES (?, ?)');
		foreach($urls as $url) {
			if (!$stmt->execute(array($url, $dst_id))){
				res_log('failed.');
				$db->rollback();
				return FALSE;
			}
			res_log('  dst_id='.$dst_id.' '.$url);
		}
		$db->commit();
		res_log('success.');
		return TRUE;
	}

}

try {

	if (empty($_REQUEST['_u'])){
		throw new Exception('Bad Request : url');
	}

	$url = $_REQUEST['_u'];
	$callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : null;
	$expire_sec = isset($_REQUEST['expire_sec']) ? $_REQUEST['expire_sec'] : 60*60*7;
	$use_cache =  ! isset($_REQUEST['nocache']);
	$use_log = isset($_REQEUST['log']);

	$redirects = array();
	$res = array('log'=>array($_REQUEST), 'redirects'=>&$redirects);


	$reget_remain = 10;

	$res['required_url'] = $url;

	$cache = new Cache($use_cache);
	if ($cached = $cache->get_src($url)){
		unset($cached['log']);
		$cached['cached'] = TRUE;
		$res = $cached;
	} else {

		REGET:
		if (--$reget_remain == 0){
			throw new Exception('Redirect/Refresh loop limit.');
		}

		res_log('curl:'.$url);

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

		if ($http_code == 301 || $http_code == 302) {
			array_push($redirects, $url);
			res_log('redirect '.$http_code.' '.$url);
			goto REGET;
		}

		$res['url'] = $url;
		$res['http_code'] = $http_code;
		$res['content_type'] = $info['content_type'];

		res_log($info);

		if ($http_code != 200) {
			throw new Exception('cURL Error:HTTP '.$res['http_code'].':'.$url);
		}

		if (preg_match('@^text/x?html(?:;\s*charset=(.*))?$@',$info['content_type'], $match)) {


			$detect_order = 'UTF-8,Shift-JIS,EUC-JP,ISO-2022-JP';

			$http_charset = '';
			if (count($match)==2){
				$http_charset = $match[1];
				$detect_order = $http_charset.','.$detect_order;
			}

			res_log('HTTP charset:'.$http_charset.' / detect '.$detect_order);

			//res_log($body);


			// if (strtoupper($http_charset) != 'UTF-8') {
			$body = mb_convert_encoding($body, 'UTF-8', $detect_order);
			// }

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
				goto REGET;
			}

			if ($cached = $cache->get_dst($url)) {
				unset($cached['log']);
				$cached['cached'] = TRUE;
				$res = $cached;
			} else {

				$body = preg_replace('@<script.*?>.*?</script>@smi','', $body);
				// res_log($body);

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

				// images

				$imgs_special = array();	// 特殊処理
				$imgs_same = array();		// 同一ドメイン
				$imgs_similar = array();	// 部分一致ドメイン
				$imgs = array();			// その他
				$exclude = array();			// 複数回出現除外用

				if (preg_match_all('@<img[^>]+/?>@si', $body, $matches)) {

					for ($i=0; $i<count($matches[0]) && count($imgs)<10; $i++) {

						$tag = $matches[0][$i];

						// res_log('TAG:'.$tag);

						if (!preg_match('@\\ssrc=["\']?([^"\']+)["\']?@i', $tag, $m1)){
							continue;
						}

						res_log('TAG:'.$tag);

						$url = html_entity_decode($m1[1]);

						// res_log('SRC:'.$url);

						if (preg_match('@\\swidth=["\']?(\\d+)["\']?@', $tag, $m1)){
							$width = intval($m1[1]);
							if ($width <= 32) {
								res_log('  filtered by width <= 32 : '.$width);
								continue;
							}
						}
						if (preg_match('@\\sheight=["\']?(\\d+)["\']?@', $tag, $m1)){
							$height = intval($m1[1]);
							if ($height <= 32) {
								res_log('  filtered by height <= 32 : '.$height);
								continue;
							}
						}

						if (substr($url, 0, 2) == '//') {
							$url = 'https:'.$url;
						}
						if (substr($url, 0, 4) != 'http') {
							if (substr($url,0,1) == '/') {
								$url = $baseurl['scheme'].'://'.$baseurl['host'].$url;
							} else {
								$url = $baseurl['scheme'].'://'.$baseurl['host'].$basepath.$url;
							}
						}

						// res_log('SRC-R: '.$url);

						$urlp = parse_url($url);
						$domain = $urlp['host'];
						$path = $urlp['path'];


						if ($baseurl['host'] == 'itunes.apple.com') {
							// 特殊処理 : iTunesアートワーク
							res_log('  iTunes Artwork');
							if (preg_match('@\\sclass="artwork"@', $tag)) {
								res_log('add itunes artwork : '.$url);
								if (preg_match('@17\d+x17\d+@', $path)) {
									array_unshift($imgs_special, $url);
								} else {
									array_push($imgs_same, $url);
									continue;
								}
							} else {
								res_log('skip : '.$tag);
							}
						} else if (strpos($baseurl['host'], '.amazon.') !== FALSE) {
							// 特殊処理 : Amazon商品写真
							res_log('  Amazon Product Image');
							if (preg_match('@\\s(id="prodImage"|class="prod_image_selector")@', $tag)) {
								res_log('add amazon prod image : '.$url);
								array_unshift($imgs_special, $url);
								continue;
							}
						}
							
						// 複数回出現の除外
						if ($removed = array_remove_dupl($imgs, $url) !== FALSE){
							res_log('  duplicated - remove');
							array_push($exclude, $removed);
							continue;
						}
						if (in_array($url, $exclude)){
							res_log('  duplicated - skip');
							continue;
						}
							
						// NGドメインパターン
						if (preg_match('@(^(counter|banner|ad|adv|rank|ranking)\\.|\\.(rd\\.rakuten|shinobi|i2i|i2idata|yu-yake|assoc-amazon|microad|count|counter)\\.|\\.(ad|adv|click|rank)|(ad|adv|click|rank)\\.|afl|affi|feed|ranking|analy)@', $domain, $m2)){
							res_log('  filtered by domain pattern:'.$m2[0]);
							array_push($exclude, $url);
							continue;
						}
						
						// hatena counter
						/*
						if (preg_match('@^/entry/image/https?://@', $path)){
							res_log('  filterd by /entry/image/https?// (hatena counter)');
							array_push($exclude, $url);
							continue;
						}*/
						
						$class = '';
						if(preg_match('@\\sclass=["\']?([^"\']+)["\']?@is', $tag, $m3)){
							$class = $m3[1];
						}
						/*
						if (preg_match('@\sclass="(http-bookmark|b?counter)"@is', $tag)){
							res_log('  filtered by class="http-bookmark" - Hatena Bookmark Counter');
							array_push($exclude, $url);
							continue;
						}*/

						// NG単語を含むPath,Class : 単語 = 異種文字区切り(CamelCase)含む
						$parts = explode(',', 'beacon,sprite,bcn,sprt,nabi,navi,nav,ad,adv,sample,smpl,rnk,rank,ranking,mail,schedule,tool,'
								.'clip,widget,on,off,bunner,bnr,to,jump,link,search,'
								.'detail,translate,dot,dots,loading,corner,tl,tr,bl,br,home,refresh,bookmarks,bookmark,'
								.'flash,arrow,arw,subscribe,top,bottom,btm,bdr,border,tbl,table,hr,right,left,'
								.'head,header,trackback,counter,bcounter,cntr,http://,https://,space,spacer,menu,foot,footer,bar,empty,bg,backgorund,'
								.'spinner,spin,transparent,toumei,parts,clear,icon,icn,ico,next,prev,tab,bt,but,btn,button,'
								.'powered,poweredby,side,lbl,label,tab,nav,login,logout,sign,count,cnt,banner,menu,track,plugin,plugins,rss,xml,pdf');

						usort($parts, function($a, $b){
							return strlen($a)<strlen($b) ? 1:-1;
						});

						// 単語っぽい部分抜き出し
						$bits = extract_string($class.','.$path, 2);
						res_log('  extract_string:'.join(',', $bits));

						$found = FALSE;
						foreach($bits as $bit) {
							if (in_array($bit, $parts)){
								$found = TRUE;
								break;
							}
						}
						if ($found){
							res_log('  filtered by path/class pattern (extarcted word):'.$bit);
							array_push($exclude, $url);
							continue;
						}

						// NG単語を部分文字列として２つ以上含むPath
						$found = 0;
						$path_l = strtolower($class.','.$path);
						foreach ($parts as $part) {
							if (strlen($part) < 3){
								continue;
							}
							if (strpos($path_l, $part) !== FALSE) {
								res_log('found part 1 : '.$part);
								$path_l = str_replace($part, '', $path_l);
								foreach ($parts as $part2) {
									if (strlen($part) < 3){
										continue;
									}
									if (strpos($path_l, $part2) !== FALSE) {
										res_log('found part 2 : '.$part2);
										$found = true;
										break;
									}
								}
								if ($found) {
									break;
								}
							}
						}
						if ($found){
							res_log('  filtered by path/class pattern (substr):'.$part.','.$part2);
							array_push($exclude, $url);
							continue;
						}

						// バナーサイズっぽいPath
						if (preg_match('@(200x40|88x31|300x250|250x250|240x400|336x280|180x150|300x100|720x300|468x60|234x60|88x31|120x90|120x60|120x240|125x125|728x90|160x600|120x600|300x600|80x80|150x150|_90x|[^0-9](8|16|32|100|120)\\.)@i', $path, $m2)){
							res_log('  filtered by path pattern:'.$m2[0]);
							array_push($exclude, $url);
							continue;
						}

						// other
						if (preg_match('@http://b.hatena.ne.jp/entry/image/@', $url, $m2)){
							res_log('  filtered by path pattern:'.$m2[0]);
							array_push($exclude, $url);
							continue;
						}

						if ($domain == $baseurl['host']){
							res_log('add same domain : '.$url);
							array_push($imgs_same, $url);
						} else if (cmp_domain($domain, $baseurl['host']) > 2) {
							res_log('add similarr domain : '.$url);
							array_push($imgs_similar, $url);
						} else {
							res_log('add : '.$url);
							array_push($imgs, $url);
						}
					}
				}

				$imgs = array_merge($imgs_special, $imgs_same, $imgs_similar, $imgs);

				if ($imgs) {
					$res['imgs'] = $imgs;
				}

				$cache->set_info($res);
			}

		} else if (preg_match('@^image/@',$info['content_type'])){
			$res['imgs'] = array($res['url']);
		}
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
