create schema if not exists incrementum;

-- Set the search path to use the incrementum schema by default
set search_path to incrementum, public;

create table if not exists incrementum.account (
    id int primary key generated always as identity,
    name varchar(20) not null,
    phone_number varchar(15) not null unique,
    email varchar(50) not null unique,
    password_hash varchar(255) not null,
    api_key varchar(64) not null unique,
    keycloak_id varchar(255) unique null
);

create table if not exists incrementum.stock (
    symbol varchar(10) primary key,
    company_name varchar(100) not null,
    stock_history_updated_at timestamp not null default current_timestamp,
    yfinance_data_updated_at timestamp null,
    current_price decimal(15, 2) null,
    open_price decimal(15, 2) null,
    previous_close decimal(15, 2) null,
    day_high decimal(15, 2) null,
    day_low decimal(15, 2) null,
    fifty_day_average decimal(15, 2) null,
    fifty_two_week_high decimal(15, 2) null,
    fifty_two_week_low decimal(15, 2) null,
    exchange varchar(20) null,
    full_exchange_name varchar(100) null,
    industry varchar(100) null,
    sector varchar(100) null,
    country varchar(100) null,
    market_cap bigint null,
    volume bigint null,
    average_volume bigint null,
    regular_market_change_percent decimal(10, 4) null
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
    
create table if not exists incrementum.screener (
    id int primary key generated always as identity,
    screener_name varchar(20) not null,
    description varchar(300)
);

create table if not exists incrementum.custom_screener (
    id int primary key generated always as identity,
    account_id int not null references incrementum.account(id),
    screener_name varchar(100) not null,
    created_at timestamp not null default current_timestamp,
    filters json not null
);

create table if not exists incrementum.custom_collection (
    id int primary key generated always as identity,
    account_id int not null references incrementum.account(id),
    collection_name varchar(20) not null,
    c_desc varchar(300),
    purchase_prices jsonb default '{}',
    date_created date not null
);

create table if not exists incrementum.custom_collection_stock (
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