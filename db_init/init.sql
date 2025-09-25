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
    watchlist_id int not null references watchlist(id),
    stock_symbol varchar(5) not null references stock(symbol)
);
    
create table watchlist_screener (
    watchlist_id int not null references watchlist(id),
    screener_id int not null
);
