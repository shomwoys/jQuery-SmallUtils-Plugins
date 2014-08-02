CREATE TABLE IF NOT EXISTS related_links (
	url                TEXT NOT NULL UNIQUE,
	title              TEXT NOT NULL,
	query              TEXT NOT NULL,
	json               TEXT NOT NULL, /* cached result as json */
	error              TEXT,
	created_at_utc     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_url on related_links(src);
