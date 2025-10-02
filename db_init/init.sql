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
    created_at timestamp not null default current_timestamp
);

create table numeric_filter (
    id int primary key generated always as identity,
    name varchar(50) not null
);

create table custom_screener_numeric (
    custom_screener_id int not null references custom_screener(id),
    numeric_filter_id int not null references numeric_filter(id),
    numeric_value int not null,
    operator varchar(10) not null
);

create table categorical_filter (
    id int primary key generated always as identity,
    name varchar(50) not null
);

create table custom_screener_categorical (
    custom_screener_id int not null references custom_screener(id),
    categorical_filter_id int not null references categorical_filter(id),
    category_value varchar(20) not null
);

create table watchlist_custom_screener (
    watchlist_id int not null references watchlist(id),
    custom_screener_id int not null references custom_screener(id)
);

-- Seed categorical filters
INSERT INTO categorical_filter (name) VALUES 
    ('sector'),
    ('industry'),
    ('exchange'),
    ('country'),
    ('market_cap_category'),
    ('dividend_yield_category')
ON CONFLICT DO NOTHING;

-- Seed numeric filters  
INSERT INTO numeric_filter (name) VALUES 
    -- Market metrics
    ('market_cap'),
    ('enterprise_value'),
    ('shares_outstanding'),
    
    -- Valuation ratios
    ('pe_ratio'),
    ('pb_ratio'),
    ('ps_ratio'),
    ('peg_ratio'),
    ('ev_ebitda'),
    ('price_to_cash_flow'),
    
    -- Financial metrics
    ('revenue'),
    ('revenue_growth'),
    ('gross_profit'),
    ('gross_margin'),
    ('operating_income'),
    ('operating_margin'),
    ('net_income'),
    ('net_margin'),
    ('ebitda'),
    ('ebitda_margin'),
    
    -- Balance sheet
    ('total_debt'),
    ('debt_to_equity'),
    ('current_ratio'),
    ('quick_ratio'),
    ('cash_and_equivalents'),
    
    -- Returns
    ('return_on_equity'),
    ('return_on_assets'),
    ('return_on_invested_capital'),
    
    -- Dividends
    ('dividend_yield'),
    ('dividend_per_share'),
    ('payout_ratio'),
    
    -- Stock performance
    ('beta'),
    ('price_52w_high'),
    ('price_52w_low'),
    ('volume'),
    ('average_volume'),
    ('price_change_1d'),
    ('price_change_5d'),
    ('price_change_1m'),
    ('price_change_3m'),
    ('price_change_6m'),
    ('price_change_1y'),
    
    -- Other metrics
    ('analyst_rating'),
    ('analyst_target_price'),
    ('insider_ownership'),
    ('institutional_ownership')
ON CONFLICT DO NOTHING;
