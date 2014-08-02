CREATE TABLE IF NOT EXISTS redirects (
	src                TEXT NOT NULL UNIQUE PRIMARY KEY,
	dst_id             INTEGER NOT NULL,
	created_at_utc     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS info (
	dst_id             INTEGER PRIMARY KEY AUTOINCREMENT ,
	url                TEXT NOT NULL UNIQUE,
	json               TEXT NOT NULL,
	error              TEXT,
	created_at_utc     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_url on redirects(src);
