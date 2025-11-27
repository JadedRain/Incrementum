import requests
import time
import csv
import json
import os


def fetch_fear_greed_json(start_date='2023-11-17', retries=3, timeout=10):
    BASE_URL = (
        "https://production.dataviz.cnn.io/index/"
        "fearandgreed/graphdata/"
    )
    headers = {
        'User-Agent': (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/120.0.0.0 Safari/537.36'
        )
    }
    url = f"{BASE_URL}{start_date}"
    last_exc = None
    for _ in range(retries):
        try:
            r = requests.get(url, headers=headers, timeout=timeout)
            r.raise_for_status()
            return r.json()
        except requests.RequestException as exc:
            last_exc = exc
            time.sleep(0.5)
    raise last_exc if last_exc is not None else Exception(
        'Failed to fetch fear & greed data'
    )


def fetch_and_save_fear_greed_csv(output_path=None):
    data = fetch_fear_greed_json()

    if output_path is None:
        repo_api_dir = os.path.dirname(__file__)
        db_init_dir = os.path.join(repo_api_dir, 'db_init')
        os.makedirs(db_init_dir, exist_ok=True)
        output_path = os.path.join(db_init_dir, 'fear_greed.csv')

    if (
        isinstance(data, list)
        and data
        and all(isinstance(d, dict) for d in data)
    ):
        fieldnames = set()
        for row in data:
            fieldnames.update(row.keys())
        fieldnames = list(fieldnames)
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for row in data:
                writer.writerow({
                    k: json.dumps(v) if isinstance(v, (list, dict)) else v
                    for k, v in row.items()
                })
        return

    if isinstance(data, dict):
        for key, val in data.items():
            if (
                isinstance(val, list)
                and val
                and all(isinstance(d, dict) for d in val)
            ):
                fieldnames = set()
                for row in val:
                    fieldnames.update(row.keys())
                fieldnames = list(fieldnames)
                with open(output_path, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()
                    for row in val:
                        writer.writerow(
                            {
                                k: json.dumps(v)
                                if isinstance(v, (list, dict))
                                else v
                                for k, v in row.items()
                            }
                        )
                return

        fieldnames = list(data.keys())
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerow({
                k: json.dumps(v) if isinstance(v, (list, dict)) else v
                for k, v in data.items()
            })
        return

    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['raw'])
        writer.writerow([json.dumps(data)])
