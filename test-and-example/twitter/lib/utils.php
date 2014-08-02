<?php

function expire_header($expire_sec=-1000){
	if ($expire_sec) {
		header('Cache-Control: public, max-age='.$expire_sec);
		header('Expires: '.gmdate('D, d M Y H:i:s', time()+$expire_sec).' GMT');
	} else {
		header('Cache-Control: no-cache, must-revalidate');
		header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	}
}

function json_response($array, $expire_sec=-1000){
	expire_header($expire_sec);
	header('Content-Type: application/json');
	echo json_encode($array);
}

function jsonp_response($array, $callback, $expire_sec=-1000){
	if (preg_match('/^[a-zA-Z0-9_]+$/i', $callback) == 0) {
		// die('{"error":"invalid callback"}');
		header('HTTP', true, 400);
		die("invalid callback : ".$callback);
	}
	expire_header($expire_sec);
	header('Content-Type: application/json');
	echo $callback."(".json_encode($array, TRUE).")";
}

//session_start();

function twSetOAuthToken($user, $user_token, $user_token_secret){
	if (!$_SESSION[$user]) {
		$_SESSION[$user] = array();
	}
	$_SESSION[$user]['tw_access_token'] = array(
		'oauth_token'=>$user_token,
		'oauth_token_secret'=>$user_token_secret
	);
}

function twGetOAuthToken($user){
	if (!isset($_SESSION[$user])){
		return null;
	}
	if (!$_SESSION[$user]){ return null; }
	return $_SESSION[$user]['tw_access_token'];
}
