create schema if not exists user_data;

-- Set the search path to use the user_data schema by default
set search_path to user_data, public;

-- User account table
create table user_data.account (
    id int primary key generated always as identity,
    name varchar(20) not null,
    phone_number varchar(15) not null unique,
    email varchar(50) not null unique,
    password_hash varchar(255) not null,
    api_key varchar(64) not null unique,
    keycloak_id varchar(255) unique null
);

-- Custom user-created screeners
create table user_data.custom_screener (
    id int primary key generated always as identity,
    account_id int not null references user_data.account(id),
    screener_name varchar(100) not null,
    created_at timestamp not null default current_timestamp,
    filters json not null
);

-- Custom screener numeric filter values
create table user_data.custom_screener_numeric (
    id int primary key generated always as identity,
    custom_screener_id int not null references user_data.custom_screener(id) on delete cascade,
    numeric_filter_id int not null, -- References stock_data.numeric_filter(id) - cross-schema reference
    numeric_value integer,
    unique (custom_screener_id, numeric_filter_id)
);

-- Custom screener categorical filter values
create table user_data.custom_screener_categorical (
    id int primary key generated always as identity,
    custom_screener_id int not null references user_data.custom_screener(id) on delete cascade,
    categorical_filter_id int not null, -- References stock_data.categorical_filter(id) - cross-schema reference
    category_value varchar(20),
    unique (custom_screener_id, categorical_filter_id)
);

-- User custom collections (watchlists)
create table user_data.custom_collection (
    id int primary key generated always as identity,
    account_id int not null references user_data.account(id),
    collection_name varchar(20) not null,
    c_desc varchar(300),
    date_created date not null
);

-- Stocks in user collections - references stock data across schemas
create table user_data.custom_collection_stock (
    collection_id int not null references user_data.custom_collection(id),
    stock_symbol varchar(10) not null -- References stock_data.stock(symbol) - cross-schema reference
);

-- Unique constraint for collection stocks
alter table user_data.custom_collection_stock
    add constraint custom_collection_stock_collection_id_stock_symbol_key unique (collection_id, stock_symbol);

-- User stock potential purchases
create table if not exists user_data.user_stock_potential (
    id int primary key generated always as identity,
    account_id int not null references user_data.account(id) on delete cascade,
    stock_symbol varchar(10) not null, -- References stock_data.stock(symbol) - cross-schema reference
    purchase_date date not null,
    quantity numeric(15, 4) not null,
    purchase_price numeric(15, 2) not null
);

-- Insert test account for development/testing
-- API Key: test-api-key-12345
-- Email: testuser@example.com
-- Password: password (hashed with bcrypt)
INSERT INTO user_data.account (name, phone_number, email, password_hash, api_key)
VALUES (
    'Test User',
    '5555555555',
    'testuser@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5n4mZJZthPWeu',
    'test-api-key-12345'
)
ON CONFLICT (email) DO NOTHING;