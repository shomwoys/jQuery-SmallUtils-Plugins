<?php

// Twitter Application Key
define('CONSUMER_KEY','jt3Z4yBnTie3J3XLmecw');
define('CONSUMER_SECRET','h7zRGMH0gj1TrIHna9UjT0SHE8Qbzhe4mxPIWWPlb5g');

// User Access Token
// define('ACCESS_TOKEN','5108251-SsYnNvzFUWqwrJoy7si8x81XZnI0hjjtCd4RcWNcaN');
// define('ACCESS_TOKEN_SECRET','ntPbmRFtCuNETVYWksAUgj094SQm2PkVFU9I5s0203w');

define('USER_AGENT', $_SERVER['HTTP_USER_AGENT']);

/////////////////// global consts

$NOAUTH_API_REST_REGEXP = array(
	'@^1/statuses/(?P<id>\d+)/retweeted_by$@', // user
	'@^1/statuses/(?P<id>\d+)/retweeted_by/ids$@', // status
	'@^1/statuses/show/(?P<id>\d+)$@',
	'@^1/users/profile_image/(?P<screen_name>[a-zA-Z0-9_-]+)$@',
	'@^1/users/suggestions/(?P<slug>[^/]+)$@',
	'@^1/users/suggestions/(?P<slug>[^/]+)/members$@',
	'@^1/geo/id/(?P<place_id>[^/]+)$@',
	'@^1/trends/(?P<woeid>\d+)$@', // yahoo! Where On Earth ID - http://api.twitter.com/1/trends/available.json
);

$NOAUTH_API_REST =  array(
	'search',
	'1/statuses/oembed', //
	'1/search',
	'1/followers/ids',
	'1/friends/ids',
	'1/friendships/exists',
	'1/friendships/show',
	'1/users/lookup',
	'1/users/show',
	'1/users/contributees',
	'1/users/contributors',
	'1/users/suggestions',
	'1/lists/all',
	'1/lists/statuses',
	'1/lists/memberships',
	'1/lists/subscribers',
	'1/lists/members',
	'1/lists',
	'1/lists/show',
	'1/lists/subscriptions',
	'1/account/rate_limit/status',
	'1/geo/reverse_geocode',
	'1/geo/search',
	'1/geo/similar_places',
	'1/trends/available',
	'1/trends/daily',
	'1/trends/weekly',
	'1/help/test',
	'1/help/configuration',
	'1/help/languages',
	'1/legal/privacy',
	'1/legal/tos',
);

$TW_CODES = array(
	200 => 'OK',
	304 => 'Not Modified',
	400 => 'Bad Request - rate limit?',
	401 => 'Unauthorized',
	403 => 'Forbidden - update limit?',
	404 => 'Not Found',
	406 => 'Not Acceptable',
	420 => 'Enhance Your Calm - rate limit? for serach/trend',
	500 => 'Internal Server Error',
	502 => 'Bad Gateway - Twitter is down or being upgraded',
	503 => 'Service Unavailable - overloaded?',
	504 => 'Gateway timeout - stacked?'
);

