# Codescape Financial Toolkit

## Configuration Variables

```ini
# overall data path; the app will expand tilde paths
CSFIN_DATA_DIR=~/datadir

# application data JSON file (optional; defaults to "application-data.json")
# this path is relative to CSFIN_DATA_DIR
JSON_APPDATA_FILE_NAME=application-data.json

# stock metadata JSON file (optional; defaults to "stock-metadata.json")
# this path is relative to CSFIN_DATA_DIR
JSON_STOCK_METADATA_FILE_NAME=stock-metadata.json

# dividend data JSON file (optional; defaults to "dividend-data.json")
# this path is relative to CSFIN_DATA_DIR
JSON_DIVIDEND_DATA_FILE_NAME=dividend-data.json

# stock splits JSON file (optional; defaults to "stock-split-data.json")
# this path is relative to CSFIN_DATA_DIR
JSON_STOCK_SPLITS_FILE_NAME=stock-split-data.json

# directory containing the transaction CSV files (optional; defaults to "transactions")
# this path is relative to CSFIN_DATA_DIR
RAW_TRANSACTION_DATA_DIR_NAME=transactions

# directory containing the quote data CSV files (optional; defaults to "quotes")
# this path is relative to CSFIN_DATA_DIR
RAW_QUOTE_DATA_DIR_NAME=quotes
```
