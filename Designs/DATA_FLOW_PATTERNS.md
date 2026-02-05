# Data Flow and Query Patterns

## Query Flow Examples

### Simple Stock Query
```
User → React Client → Django API → Database Router → Stock DB
                                                   ↓
Stock DB → Router → API → Client → User
```

### Complex User Collection Query
```
1. User requests watchlist
   User → Client → API: GET /api/collections/1

2. Get collection metadata
   API → Router → User DB: Query custom_collection
   User DB → Router → API: Collection info

3. Get stock symbols in collection  
   API → Router → User DB: Query custom_collection_stock
   User DB → Router → API: Stock symbols [AAPL, GOOGL, ...]

4. Enrich with stock details (cross-database)
   API → Router → Stock DB: Query stock WHERE symbol IN (...)
   Stock DB → Router → API: Stock details

5. Combine and return
   API → Client → User: Complete watchlist with stock data
```

### Custom Screener Creation Flow
```
1. User creates screener
   User → Client → API: POST /api/screeners/custom

2. Save screener definition
   API → Router → User DB: INSERT custom_screener
   User DB → Router → API: Screener ID

3. Save filter criteria (cross-schema references)
   API → Router → User DB: INSERT custom_screener_numeric
                           (references stock_data.numeric_filter.id)
   API → Router → User DB: INSERT custom_screener_categorical  
                           (references stock_data.categorical_filter.id)

4. Execute screener logic
   API → Router → Stock DB: Complex query with filters
   Stock DB → Router → API: Matching stocks

5. Return results
   API → Client → User: Screener results
```

## Database Performance Patterns

### Stock Database Optimization
```
Read-Heavy Operations:
├── Stock search and filtering
├── Historical price queries
├── Screener execution
├── Market data analysis
└── Bulk data imports

Optimization Strategies:
├── Read replicas for analytics
├── Indexed timestamp columns
├── Partitioned stock_history table
├── Materialized views for common queries
└── Connection pooling for read operations
```

### User Database Optimization
```
Transaction-Heavy Operations:
├── User authentication
├── Collection management
├── Screener CRUD operations
├── User preference updates
└── Session management

Optimization Strategies:
├── Write-optimized storage
├── User-specific caching
├── Session clustering
├── Fast user lookups
└── Audit logging
```

## Cross-Database Integration Patterns

### Application-Level Joins
```python
# Django ORM example for user collection with stock details
def get_user_collection_with_stocks(collection_id):
    # 1. Get collection from user database
    collection = CustomCollection.objects.using('default').get(id=collection_id)
    
    # 2. Get stock symbols from user database
    symbols = CustomCollectionStock.objects.using('default')\
        .filter(collection=collection)\
        .values_list('stock_symbol', flat=True)
    
    # 3. Get stock details from stock database
    stocks = Stock.objects.using('stock_db')\
        .filter(symbol__in=symbols)
    
    # 4. Combine results at application level
    return {
        'collection': collection,
        'stocks': list(stocks)
    }
```

### Caching Strategy
```
┌─────────────────┐    ┌─────────────────┐
│   Stock Data    │    │   User Data     │
│   (Source DB)   │    │   (Source DB)   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ↓                      ↓
┌─────────────────┐    ┌─────────────────┐
│  Redis Cache    │    │  Redis Cache    │
│ (Stock Prices)  │    │ (User Sessions) │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────┬─────┬─────────┘
                 ↓     ↓
           ┌─────────────────┐
           │   Django API    │
           │ (Unified Cache) │
           └─────────────────┘
```

### Error Handling for Cross-Database Operations
```python
def create_screener_with_filters(user_id, screener_data, filters):
    try:
        with transaction.atomic(using='default'):
            # Create screener in user database
            screener = CustomScreener.objects.using('default').create(
                account_id=user_id,
                **screener_data
            )
            
            # Validate filter references exist in stock database
            for filter_data in filters:
                if filter_data['type'] == 'numeric':
                    if not NumericFilter.objects.using('stock_db')\
                        .filter(id=filter_data['filter_id']).exists():
                        raise ValidationError(f"Invalid numeric filter: {filter_data['filter_id']}")
                        
            # Create filter relationships
            for filter_data in filters:
                CustomScreenerNumeric.objects.using('default').create(
                    custom_screener=screener,
                    numeric_filter_id=filter_data['filter_id'],
                    numeric_value=filter_data['value']
                )
                
            return screener
            
    except Exception as e:
        # Rollback handled by transaction.atomic
        logger.error(f"Failed to create screener: {e}")
        raise
```

## Migration and Deployment Strategy

### Database Migration Order
```
1. Deploy Stock Database
   ├── Run init_stock_data.sql
   ├── Migrate stock-related models
   └── Verify stock data integrity

2. Deploy User Database  
   ├── Run init_user_data.sql
   ├── Migrate user-related models
   └── Verify user data integrity

3. Add Cross-Schema Constraints
   ├── Run init_combined.sql
   ├── Add foreign key constraints
   └── Verify referential integrity

4. Update Application
   ├── Deploy new Django settings
   ├── Update database router
   └── Test cross-database queries
```

### Rollback Strategy
```
If Split Fails:
├── Restore from single database backup
├── Revert Docker configuration
├── Switch Django settings back
└── Verify all functionality

If Partial Success:
├── Keep successful database
├── Migrate failed data manually
├── Fix cross-schema references
└── Complete split deployment
```