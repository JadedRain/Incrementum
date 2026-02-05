#!/usr/bin/env python3
"""Remove verbose logging from files."""
import re

files_to_clean = [
    "/home/wolf/Incrementum/Incrementum.api/Incrementum/managers/stock_history_api_manager.py",
    "/home/wolf/Incrementum/Incrementum.api/Incrementum/stock_history_service.py",
]

for filepath in files_to_clean:
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Remove logger.info/debug lines that have only debug/info tags with no meaningful info
    # Keep lines that actually log important information
    patterns_to_remove = [
        r'\s*logger\.info\(f"\[.*?\] .*?"\)\n',  # Generic logger.info calls
        r'\s*self\.logger\.info\(f"\[.*?\] .*?"\)\n',  # Generic self.logger.info calls
        r'\s*logger\.debug\(.*?\)\n',  # All debug calls
        r'\s*self\.logger\.debug\(.*?\)\n',  # All self.logger.debug calls
    ]
    
    # More selective - only remove the obviously verbose ones
    simple_removals = [
        (r'            logger\.info\(f"\[GET_API_DATA\] API call returned"\)\n', ''),
        (r'            self\.logger\.info\(f"\[GET_DB_HISTORY\] Applied order_by"\)\n', ''),
        (r'            self\.logger\.info\(f"\[GET_DB_HISTORY\] Calling queryset\.exists\(\)\.\.\."\)\n', ''),
        (r'            self\.logger\.info\(f"\[GET_DB_HISTORY\] Starting iteration\.\.\."\)\n', ''),
        (r'            logger\.info\(f"\[ITER\] Beginning to yield items"\)\n', ''),
        (r'            logger\.info\(f"\[COUNT\] Calling _get_api_data"\)\n', ''),
        (r'            logger\.info\(f"\[COUNT\] Result: \{count\} records"\)\n', ''),
    ]
    
    for pattern, replacement in simple_removals:
        content = re.sub(pattern, replacement, content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Cleaned: {filepath}")
    else:
        print(f"No changes: {filepath}")
