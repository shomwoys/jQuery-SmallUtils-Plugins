<?php

/**
 * This is jquery-form.js:$.formPost test server program.
 * form validation and send mail with form values.
 * required PEAR::Mail, PEAR::Net_SMTPr
 */

$errors = array();

try {

	// PEAR::Mail
	require_once('Mail.php');
	
	$MAIL_REGEX = '/^([a-zA-Z0-9])+([a-zA-Z0-9\._+-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/';
	$URL_REGEX = '/^(https?|ftp|file):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#\/%=~_|]$/';
	
	////////////////////////////////////////////////////////////////////////////////////
	// definitions
	
	// input and require/validation
	//   <Label on Mail> => array(<POST param>, <required count>, <validation RegExp>, <error message>)
	$params = array(
		'Not Required Text' 
			=> array('text',		0,	'/^.*$/', ''),
		'URL'
			=> array('url',			1,	$URL_REGEX, 'URL is invalid.'),
		'e-mail' 
			=> array('email',		1,	$MAIL_REGEX, 'email is invalid.'),
		'e-mail confirm' 
			=> array('email2',		1,	$MAIL_REGEX, 'email confirm is invalid.'),
		'Radio' 
			=> array('radio',		1,	'/^rad\d$/', 'select one'),
		'Checkbox' 
			=> array('checkbox',	0,	'/^cb\d$/', 'bad checkbox'),
		'Checkbox' 
			=> array('checkbox2',	2,	'/^cb\d$/', 'check 2+'),
	);
	
	// validate relations
	//    $values = array( <Label on Mail> => <POSTed param values array> )
	//    when error array_push($errors, array('<POST param>', '<Error Message>'));
	function relations($values, &$errors) {

		if ($values['e-mail'][0] != $values['e-mail confirm'][0]) {
			$errors['email2'] = 'email confirm is not same as email.';
		}
		
	}

	// parameters of mail
	
	/* for local smtp server */
	$mail_params = array(
		'host' => 'localhost',
		'port' => '25',
		'auth' => false,
		'username' => '',
		'password' => ''
	);
	
	/* for gmail */
	$mail_params = array(
		'host'=>'tls://smtp.gmail.com',
		'port'=>465,
		'auth'=>true,
		'debug'=>false,
		'username'=>'<SMTP USERNAME>',
		'password'=>'<PASSWORD>',
	);
	
	$header = array(
		'From' => 'noreply@exmaple.com',
		'To' => 'target_address@exmaple.com',
		//'Bcc' => 'bcc_address@exmaple.com',
		//'Cc' => 'cc_address@exmaple.com',
		'Subject' => 'test form from jquery-form-posttest.php'
	);
	
	// mail body : append <Label on Mail> : <Posted Value>
	$body = array('This mail is sent by jquery-form-posttest.php.','','');
	
	//////////////////////////////////////////////////////////////////////////////////
	
	function json_response($result){
		header("Content-Type: application/json");
		header("Cache-Control: no-store, no-cache, must-revalidate");
		header("Cache-Control: post-check=0, pre-check=0", false);
		echo json_encode($result);
	}
	
	$values = array();
	
	foreach ( $params as $label => $specs ) {
		$param = $specs[0];
		$reqired_count = $specs[1];
		$regex = $specs[2];
		$errmsg = $specs[3];
		$v = $_REQUEST[$param];
		if (is_null($v)) {
			if ($required) {
				$errors[$param] = $errmsg;
				continue;
			}
			$v = '';
		}
		if (!is_array($v)) {
			$v = array($v);
		}
		foreach ($v as $vc) {
			$vc = trim($vc);
			if (!preg_match($regex, $vc)){
				$errors[$param] = $errmsg;
				continue;
			}
		}
		$empties_count = array_count_values($v);
		if ($required > count($v) - $empties_count[''] ){
			$errors[$param] = $errmsg;
			continue;
		}
		$values[$label] = $v;
		array_push($body, $label.' : '.implode(',', $v));
	}

	if (!$errors) {
		relations($values, $errors);
	}

	if (!$errors) {
		$body = join("\n", $body);
		
		$recipient = $header['To'];
		if ($header['Cc']) {
			$recipient .= ','.$header['Cc'];
		}
		if ($header['Bcc']) {
			$recipient .= ','.$header['Bcc'];
		}
		
		$mail = Mail::factory('smtp', $mail_params);
		$ret = $mail->send($recipient, $header, $body);
		if ( PEAR::isError($ret)) {
			throw new Exception($ret->getMessage());
		} else {
			$result = array('success' => true);
		}
	}

	if ($errors) {
		$result = array('errors' => $errors);
	}

} catch (Exception $ex) {
	$result = array('systemerror' => $ex->getMessage());
}

json_response($result);
