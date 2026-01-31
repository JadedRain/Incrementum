# Database Split Architecture Documentation

## Current vs Proposed Architecture

### Current Single Database Architecture
```
┌─────────────────────────────────────┐
│         PostgreSQL                  │
│      (Incrementum_DB)              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    incrementum schema       │   │
│  │                             │   │
│  │  ├── account                │   │
│  │  ├── stock                  │   │
│  │  ├── stock_history          │   │
│  │  ├── blacklist              │   │
│  │  ├── custom_screener        │   │
│  │  ├── custom_collection      │   │
│  │  ├── custom_collection_stock│   │
│  │  ├── user_stock_potential   │   │
│  │  ├── screener               │   │
│  │  ├── numeric_filter         │   │
│  │  └── categorical_filter     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
                 ↑
         [Django API] - Single Connection
```

### Proposed Split Database Architecture
```
┌─────────────────────────────┐    ┌─────────────────────────────┐
│      Stock Database         │    │      User Database          │
│       (Stock_DB)           │    │       (User_DB)            │
│                            │    │                            │
│ ┌─────────────────────────┐ │    │ ┌─────────────────────────┐ │
│ │   stock_data schema     │ │    │ │   user_data schema      │ │
│ │                         │ │    │ │                         │ │
│ │ ├── stock               │ │    │ │ ├── account             │ │
│ │ ├── stock_history       │ │    │ │ ├── custom_screener     │ │
│ │ ├── blacklist           │ │    │ │ ├── custom_collection   │ │
│ │ ├── screener            │ │    │ │ ├── custom_collection_  │ │
│ │ ├── numeric_filter      │ │    │ │ │   stock               │ │
│ │ └── categorical_filter  │ │    │ │ ├── user_stock_potential│ │
│ └─────────────────────────┘ │    │ │ ├── custom_screener_    │ │
│                            │    │ │ │   numeric             │ │
│ Port: 5433                 │    │ │ └── custom_screener_    │ │
│ Read-heavy operations      │    │ │     categorical         │ │
│ Stock market data          │    │ └─────────────────────────┘ │
└─────────────────────────────┘    │                            │
                ↑                   │ Port: 5434                 │
                │                   │ User-specific data         │
                │                   │ Write operations           │
                │                   └─────────────────────────────┘
                │                                   ↑
                └─────────────[Django API]─────────┘
                         Multi-database connections
```

## Cross-Schema Relationships

### Tables and Their Assignments

**Stock Database (stock_data schema):**
- `stock` - Core stock information
- `stock_history` - Price history data
- `blacklist` - Stock blacklist entries
- `screener` - Predefined screener definitions
- `numeric_filter` - Numeric filter types
- `categorical_filter` - Categorical filter types

**User Database (user_data schema):**
- `account` - User account information
- `custom_screener` - User-created screeners
- `custom_collection` - User watchlists/collections
- `custom_collection_stock` - Stocks in user collections *(cross-schema reference)*
- `user_stock_potential` - User stock positions *(cross-schema reference)*
- `custom_screener_numeric` - Custom screener numeric filters *(cross-schema reference)*
- `custom_screener_categorical` - Custom screener categorical filters *(cross-schema reference)*

### Cross-Schema Foreign Keys

```
user_data.custom_collection_stock.stock_symbol 
    → stock_data.stock.symbol

user_data.user_stock_potential.stock_symbol 
    → stock_data.stock.symbol

user_data.custom_screener_numeric.numeric_filter_id 
    → stock_data.numeric_filter.id

user_data.custom_screener_categorical.categorical_filter_id 
    → stock_data.categorical_filter.id
```

## Benefits of Split Architecture

### Performance Benefits
- **Stock Database**: Optimized for read-heavy operations
- **User Database**: Optimized for user-specific transactions
- **Independent Scaling**: Scale each database based on usage patterns
- **Reduced Lock Contention**: Separate write operations

### Development Benefits
- **Clear Separation of Concerns**: Stock data vs user data
- **Independent Deployments**: Database schema changes can be isolated
- **Better Security**: Different access controls for different data types
- **Easier Maintenance**: Focused database administration

### Infrastructure Benefits
- **Backup Strategies**: Different backup schedules for different data types
- **Replication**: Stock data can be replicated for read performance
- **Resource Allocation**: Different hardware optimization for each database

## Implementation Considerations

### Django ORM Integration
- **Database Router**: Routes queries to appropriate database
- **Model Declarations**: Models specify which database to use
- **Cross-Database Joins**: Handled at application level
- **Migration Management**: Separate migration paths for each database

### Docker Configuration
```yaml
services:
  stock_db:    # Port 5433
  user_db:     # Port 5434
  api:         # Connects to both databases
  dash:        # Analytics connecting to both
```

### Environment Variables
```bash
# Stock Database
STOCK_DATABASE_NAME=Stock_DB
STOCK_DATABASE_USER=Stock_User
STOCK_DATABASE_PASSWORD=${STOCK_DB_PASSWORD}
STOCK_DATABASE_HOST=stock_db

# User Database  
USER_DATABASE_NAME=User_DB
USER_DATABASE_USER=User_User
USER_DATABASE_PASSWORD=${USER_DB_PASSWORD}
USER_DATABASE_HOST=user_db
```