<?php

require 'lib/settings.php';
require 'lib/utils.php';
require 'lib/tmhOAuth.php';
require 'lib/tmhUtilities.php';

try {

	session_start();

	$method = strtoupper($_SERVER['REQUEST_METHOD']);
	if (!in_array($method, array('POST','GET','DELETE'))) {
		throw new Exception('invalid method:'.$method);
	}

	if (empty($_REQUEST['_p'])){
		header('HTTP','',400);
		throw new Exception('missing _p');
	}
	
	$path = $_REQUEST['_p'];
	
	$params = $_REQUEST;
	
	unset($params['_p']);
	unset($params['PHPSESSID']);
	unset($params['_']);

	$tmhOAuth = new tmhOAuth(array(
		'consumer_key'    => CONSUMER_KEY,
		'consumer_secret' => CONSUMER_SECRET,
	));

	$access_token = twGetOAuthToken(session_id());

	if (!$access_token){

		$found = false;
		if (array_search($path, $NOAUTH_API_REST) !== FALSE) {
			$found = true;
		} else {
			foreach ($NOAUTH_API_REST_REGEXP as $regex) {
				if (preg_match($regex, $path)){
					$found = true;
					break;
				}
			}
		}

		if (!$found){
			json_response(array(
				'not_logined'=>true,
				'error_message'=>'Not Logined',
				'error'=> array(
					'method'=>$method,
					'path'=>$path,
					'params'=>$params,
				)
			));
			exit;
		}
	} else {

		$tmhOAuth->config['user_token'] = $access_token['oauth_token'];
		$tmhOAuth->config['user_secret'] = $access_token['oauth_token_secret'];
	}

	if ($path === 'search') {
		$ret = $tmhOAuth->request('GET', 'http://search.twitter.com/search.json', $params, false);
	} else {
		$ret = $tmhOAuth->request($method, $tmhOAuth->url($path), $params);
	}
	
	if ($ret == 200) {
		/*$res = array(
			'response'=>json_decode($tmhOAuth->response['response']),
		);*/
		$res = json_decode($tmhOAuth->response['response']);
		
		$headers = $tmhOAuth->response['headers'];
		if (isset($headers['x_ratelimit_limit'])){
			/*
			$reset_time = $headers['x_ratelimit_reset'];
			$res['ratelimit'] = array(
				'hourly_limit'=>$headers['x_ratelimit_limit'],
				'remaining_hits'=>$headers['x_ratelimit_remaining'],
				'reset_time_in_seconds'=>$reset_time,
				'reset_time'=>date('D M j H:i:s O Y', $reset_time)
			);
			*/
			foreach ($headers as $key => $value){
				if (substr(strtolower($key),0,strlen('x_ratelimit_')) == 'x_ratelimit_') {
					// header(preg_replace('^x_ratelimit_', 'X-Rate', strtoupper($key)), $value);
					//header(preg_replace('@_@','-', strtoupper($key).': '), $value);
					header($key.': '.$value);
				}
			}
		}
		json_response($res);
	} else {
		json_response(array(
			'tmhOauth'=>$tmhOAuth,
			'error_message'=>$TW_CODES[$ret],
			'error'=>$tmhOAuth->response,
			'params'=>$params,
		));
	}

} catch (Exception $ex) {
	json_response(array(
		'servererror' => $ex->getMessage()
	));
}
