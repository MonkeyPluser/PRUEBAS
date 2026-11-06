#!/usr/bin/env python3
"""Cache public Skinport CS2 listing minima for the static FranV6X site.

Only public market listings are stored, never credentials or account data.
The file is updated by GitHub Actions and served statically by GitHub Pages.
"""
import json
import subprocess
import os
import sys
import tempfile
from urllib.parse import urlencode
from datetime import datetime, timezone
from pathlib import Path


URL = "https://api.skinport.com/v1/items"
DEST = Path(__file__).resolve().parents[1] / "prices.json"
MAX_ITEMS = 40000


def main():
    # curl handles Brotli content negotiation independently from older Python
    # requests/urllib3 decoders on GitHub runners.
    endpoint = URL + "?" + urlencode({"app_id": 730, "currency": "USD", "tradable": 0})
    command = [
        "curl", "--fail", "--silent", "--show-error", "--location",
        "--compressed", "--max-time", "50", "--retry", "0",
        "-H", "Accept: application/json",
        "-H", "Accept-Encoding: br",
        "-H", "User-Agent: FranV6X-PublicPriceCache/1.0",
        endpoint,
    ]
    process = subprocess.run(command, capture_output=True, timeout=60, check=False)
    if process.returncode != 0:
        raise RuntimeError("Skinport request failed: " + process.stderr.decode("utf-8", "replace")[-400:])
    records = json.loads(process.stdout)
    if not isinstance(records, list) or not 100 < len(records) <= MAX_ITEMS:
        raise ValueError("Unexpected Skinport public catalog size")

    entries = []
    for record in records:
        if not isinstance(record, dict):
            continue
        name, price, qty = record.get("market_hash_name"), record.get("min_price"), record.get("quantity")
        if not isinstance(name, str) or "|" not in name or len(name) > 220:
            continue
        if not isinstance(price, (int, float)) or isinstance(price, bool) or price <= 0 or price > 10000000:
            continue
        if not isinstance(qty, int) or qty < 1:
            continue
        page = record.get("item_page")
        if not isinstance(page, str) or not page.startswith("https://skinport.com/"):
            page = "https://skinport.com/es/"
        entries.append({"name": name, "price": round(float(price), 2), "quantity": qty, "url": page})

    if len(entries) < 100:
        raise ValueError("Insufficient priced listings; refusing to publish truncated data")
    entries.sort(key=lambda x: x["name"])
    output = {
        "source": "Skinport public Items API",
        "currency": "USD",
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "items": entries,
    }
    DEST.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", delete=False, dir=DEST.parent, suffix=".tmp") as handle:
        json.dump(output, handle, separators=(",", ":"), ensure_ascii=False)
        temp_path = handle.name
    os.replace(temp_path, DEST)
    print(f"Cached {len(entries)} Skinport price variants to {DEST}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Price update failed: {exc}", file=sys.stderr)
        sys.exit(1)
