<?php

require 'lib/settings.php';
require 'lib/utils.php';

try {

	session_start();

	require 'lib/tmhOAuth.php';
	require 'lib/tmhUtilities.php';

	$tmhOAuth = new tmhOAuth(array(
		'consumer_key'    => CONSUMER_KEY,
		'consumer_secret' => CONSUMER_SECRET,
	));

	$here = tmhUtilities::php_self();

	$access_token = twGetOAuthToken(session_id());

	if (isset($_REQUEST['wipe'])){
		// logout
		session_destroy();
		setcookie('_twitter_session');
		// header("Location: {$here}");
		$res = array(
			'success'=>true
		);
	} else if ($access_token) {
		// logined
		/*
		 $tmhOAuth->config['user_token'] = $access_token['oauth_token'];
		$tmhOAuth->config['user_secret'] = $access_token['oauth_token_secret'];

		$ret = $tmhOAuth->request('GET', $tmhOAuth->url('1/account/verify_credentials?skip_status=1'));
		if ($ret == 200){
		$res = json_decode($tmhOAuth->response['response']);
		} else {
		$res = array(
			'error_message'=>$TW_CODES[$ret],
			'error'=>$tmhOAuth->response,
		);
		}
		*/
		$res = array('logined'=>true);

	} else if (isset($_REQUEST['oauth_verifier'])) {

		$tmhOAuth->config['user_token'] = $_SESSION['oauth']['oauth_token'];
		$tmhOAuth->config['user_secret'] = $_SESSION['oauth']['oauth_token_secret'];

		$ret = $tmhOAuth->request('POST', $tmhOAuth->url('oauth/access_token',''), array(
			'oauth_verifier'=>$_REQUEST['oauth_verifier']
		));
		if ($ret == 200){
			$access_token = $tmhOAuth->extract_params($tmhOAuth->response['response']);
			
			twSetOAuthToken(session_id(), $access_token['oauth_token'], $access_token['oauth_token_secret']);
				
			//unset($_SESSION['oauth']);
				
			// $res = json_decode($tmhOAuth->response['response']);
			//header("Location: {$here}");
			/*
			 $res = array(
			 	'success'=>true
			 );*/
			// $cookie = http_parse_cookie($tmhOAuth->response['headers']['set_cookie']);
			$cookie = $tmhOAuth->response['headers']['set_cookie'];
			header('Set-Cookie',$cookie);
			
			echo '<html><head><script></script></head><body>Authorize/Authenticate success';
			echo '<pre>'; var_dump($cookie); echo '</pre>';
			echo '</body></html>';
			exit;
		} else {
			$res = array(
				'error_message'=>$TW_CODES[$ret],
				'error'=>$tmhOAuth->response,
			);
		}
	} else if (isset($_REQEUST['denied'])) {
		// authorize denied oauth_verify
		echo '<html><head><script></script></head><body>Authorize/Authenticate denied</body></html>';
		exit;
		$res = array(
			'success'=>false,
			'user_denied'=>true
		);
	} else if (isset($_REQUEST['authenticate']) || isset($_REQUEST['authorize'])) {

		$callback = isset($_REQUEST['oob']) ? 'oob' : $here;

		$params = array('oauth_callback'=>$callback);
		if (isset($_REQUEST['force_write'])){
			$params['x_auth_access_type'] = 'write';
		} else if (isset($_REQUEST['force_read'])){
			$params['x_auth_access_type'] = 'read';
		}
		$ret = $tmhOAuth->request('POST', $tmhOAuth->url('oauth/request_token',''), $params);

		if ($ret == 200){
				
			$_SESSION['oauth'] = $tmhOAuth->extract_params($tmhOAuth->response['response']);
			$method = isset($_REQUEST['authenticate']) ? 'authenticate' : 'authorize';
			$force = isset($_REQUEST['force']) ? '&force_login=1' : '';
			$authUrl = $tmhOAuth->url("oauth/{$method}",'')."?oauth_token={$_SESSION['oauth']['oauth_token']}{$force}";
			$res = array(
				'auth_url' => $authUrl
			);
		} else {
			$res = array(
				'error_message'=>$TW_CODES[$ret],
				'error'=>$tmhOAuth->response,
			);
		}
	} else {
		$res = array('logined'=>false);
	}

	json_response($res, true);

} catch (Exception $ex) {
	json_response(array(
		'servererror' => $ex->getMessage()
	));
}
