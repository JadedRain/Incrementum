create schema if not exists incrementum;

-- Set the search path to use the incrementum schema by default
set search_path to incrementum, public;

create table incrementum.account (
    id int primary key generated always as identity,
    name varchar(20) not null,
    phone_number varchar(15) not null unique,
    email varchar(50) not null unique,
    password_hash varchar(255) not null,
    api_key varchar(64) not null unique,
    keycloak_id varchar(255) unique null
);

create table incrementum.stock (
    symbol varchar(10) primary key,
    company_name varchar(255) not null,
    updated_at timestamp not null default current_timestamp,
    description text,
    market_cap bigint,
    primary_exchange varchar(50),
    type varchar(50),
    currency_name varchar(50),
    cik varchar(20),
    composite_figi varchar(50),
    share_class_figi varchar(50),
    outstanding_shares bigint,
    homepage_url varchar(500),
    total_employees integer,
    list_date date,
    locale varchar(10),
    sic_code varchar(20),
    sic_description varchar(255)
);

create table if not exists incrementum.stock_history (
    stock_symbol varchar(20) not null references incrementum.stock(symbol),
    day_and_time timestamp not null,
    open_price integer not null,
    close_price integer not null,
    high integer not null,
    low integer not null,
    volume integer not null,
    is_hourly boolean default true,
    primary key (stock_symbol, day_and_time)
);
    
create table incrementum.screener (
    id int primary key generated always as identity,
    screener_name varchar(20) not null,
    description varchar(300)
);

create table incrementum.custom_screener (
    id int primary key generated always as identity,
    account_id int not null references incrementum.account(id),
    screener_name varchar(100) not null,
    created_at timestamp not null default current_timestamp,
    filters json not null
);

create table incrementum.custom_collection (
    id int primary key generated always as identity,
    account_id int not null references incrementum.account(id),
    collection_name varchar(20) not null,
    c_desc varchar(300),
    date_created date not null
);

create table incrementum.custom_collection_stock (
    collection_id int not null references incrementum.custom_collection(id),
    stock_symbol varchar(10) not null references incrementum.stock(symbol)
);

alter table incrementum.custom_collection_stock
    drop constraint if exists custom_collection_stock_collection_id_stock_symbol_key;

alter table incrementum.custom_collection_stock
    add constraint custom_collection_stock_collection_id_stock_symbol_key unique (collection_id, stock_symbol);

create table if not exists incrementum.blacklist (
    id int primary key generated always as identity,
    stock_symbol varchar(10) not null,
    timestamp timestamp not null,
    time_added timestamp not null,
    foreign key (stock_symbol) references incrementum.stock(symbol) on delete cascade,
    unique (stock_symbol, timestamp)
);

create table if not exists incrementum.user_stock_potential (
    id int primary key generated always as identity,
    account_id int not null references incrementum.account(id) on delete cascade,
    stock_symbol varchar(10) not null references incrementum.stock(symbol) on delete cascade,
    purchase_date date not null,
    quantity numeric(15, 4) not null,
    purchase_price numeric(15, 2) not null
);

-- Insert test account for development/testing
-- API Key: test-api-key-12345
-- Email: testuser@example.com
-- Password: password (hashed with bcrypt)
INSERT INTO incrementum.account (name, phone_number, email, password_hash, api_key)
VALUES (
    'Test User',
    '5555555555',
    'testuser@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5n4mZJZthPWeu',
    'test-api-key-12345'
)
ON CONFLICT (email) DO NOTHING;