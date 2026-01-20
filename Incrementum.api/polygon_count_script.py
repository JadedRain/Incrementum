from polygon import RESTClient
import os

client = RESTClient(os.environ['POLYGON_API_KEY'])
count = 0

print("Counting tickers with active=True...")
for ticker in client.list_tickers(market='stocks', active=True, limit=1000):
    count += 1
    if count % 5000 == 0:
        print(f"Counted {count} so far...")

print(f"Total active tickers: {count}")

count2 = 0
print("\nCounting tickers without active filter...")
for ticker in client.list_tickers(market='stocks', limit=1000):
    count2 += 1
    if count2 % 5000 == 0:
        print(f"Counted {count2} so far...")

print(f"Total all tickers: {count2}")
