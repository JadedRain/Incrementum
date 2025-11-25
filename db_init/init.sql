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

create table incrementum.watchlist (
    id int primary key generated always as identity,
    account_id int not null references incrementum.account(id) unique,
    name varchar(50) not null
);

create table incrementum.stock (
    symbol varchar(10) primary key,
    company_name varchar(100) not null,
    updated_at timestamp not null default current_timestamp
);

create table incrementum.stock_history (
    stock_symbol varchar(20) not null references incrementum.stock(symbol),
    day_and_time timestamp not null,
    open_price integer not null,
    close_price integer not null,
    high integer not null,
    low integer not null,
    volume integer not null
);

create table incrementum.watchlist_stock (
    id int primary key generated always as identity,
    watchlist_id int not null references incrementum.watchlist(id),
    stock_symbol varchar(10) not null references incrementum.stock(symbol)
);
    
create table incrementum.screener (
    id int primary key generated always as identity,
    screener_name varchar(20) not null,
    description varchar(300)
);

create table incrementum.watchlist_screener (
    watchlist_id int not null references incrementum.watchlist(id),
    screener_id int not null references incrementum.screener(id)
);

create table incrementum.custom_screener (
    id int primary key generated always as identity,
    account_id int not null references incrementum.account(id),
    screener_name varchar(100) not null,
    created_at timestamp not null default current_timestamp,
    filters json not null
);

create table incrementum.watchlist_custom_screener (
    watchlist_id int not null references incrementum.watchlist(id),
    custom_screener_id int not null references incrementum.custom_screener(id)
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
    add constraint custom_collection_stock_collection_id_stock_symbol_key unique (collection_id, stock_symbol);