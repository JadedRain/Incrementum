create schema if not exists incrementum;
create table account (
    id int primary key generated always as identity,
    name varchar(20) not null,
    phone_number varchar(15) not null unique,
    email varchar(50) not null unique,
    password_hash varchar(255) not null,
    api_key varchar(64) not null unique
);

create table watchlist (
    id int primary key generated always as identity,
    account_id int not null references account(id) unique,
    name varchar(50) not null
);

create table stock (
    symbol varchar(5) primary key,
    company_name varchar(100) not null
);

create table watchlist_stock (
    id int primary key generated always as identity,
    watchlist_id int not null references watchlist(id),
    stock_symbol varchar(5) not null references stock(symbol)
);
    
create table screener (
    id int primary key generated always as identity,
    screener_name varchar(20) not null,
    description varchar(300)
);

create table watchlist_screener (
    watchlist_id int not null references watchlist(id),
    screener_id int not null references screener(id)
);

create table custom_screener (
    id int primary key generated always as identity,
    account_id int not null references account(id),
    screener_name varchar(100) not null,
    created_at timestamp not null default current_timestamp,
    filters json not null
);

create table watchlist_custom_screener (
    watchlist_id int not null references watchlist(id),
    custom_screener_id int not null references custom_screener(id)
);