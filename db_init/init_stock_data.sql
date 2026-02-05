create schema if not exists stock_data;

-- Set the search path to use the stock_data schema by default
set search_path to stock_data, public;

-- Stock company information table
create table stock_data.stock (
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

-- Stock price history table
create table if not exists stock_data.stock_history (
    stock_symbol varchar(20) not null references stock_data.stock(symbol),
    day_and_time timestamp not null,
    open_price integer not null,
    close_price integer not null,
    high integer not null,
    low integer not null,
    volume integer not null,
    is_hourly boolean default true,
    primary key (stock_symbol, day_and_time)
);

-- Index for stock history performance
create index if not exists idx_stock_history_symbol_time
    on stock_data.stock_history (stock_symbol, day_and_time);

-- Stock blacklist table
create table if not exists stock_data.blacklist (
    id int primary key generated always as identity,
    stock_symbol varchar(10) not null,
    timestamp timestamp not null,
    time_added timestamp not null,
    foreign key (stock_symbol) references stock_data.stock(symbol) on delete cascade,
    unique (stock_symbol, timestamp)
);

-- Index for blacklist performance
create index if not exists idx_blacklist_symbol
    on stock_data.blacklist (stock_symbol);

-- Predefined screener definitions
create table stock_data.screener (
    id int primary key generated always as identity,
    screener_name varchar(20) not null,
    description varchar(300)
);

-- Numeric filter definitions for screeners
create table stock_data.numeric_filter (
    id int primary key generated always as identity,
    name varchar(20) not null
);

-- Categorical filter definitions for screeners
create table stock_data.categorical_filter (
    id int primary key generated always as identity,
    name varchar(20) not null
);