CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE platforms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE brand_keywords (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    keyword_type VARCHAR(20)
);

CREATE TABLE brand_handles (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
    platform_id INTEGER REFERENCES platforms(id),
    handle VARCHAR(255)
);

CREATE TABLE content (
    id BIGSERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id),
    platform_id INTEGER REFERENCES platforms(id),
    text_content TEXT,
    source_url TEXT,
    author VARCHAR(255),
    created_at TIMESTAMP,
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sentiment (
    id SERIAL PRIMARY KEY,
    content_id BIGINT REFERENCES content(id) ON DELETE CASCADE,
    sentiment VARCHAR(20),
    score FLOAT,
    risk_level VARCHAR(20),
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    brand_id INTEGER REFERENCES brands(id),
    date_from DATE,
    date_to DATE,
    file_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);