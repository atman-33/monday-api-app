# monday.com Doc Scraper

This project scrapes content from monday.com Doc columns and exports it to a CSV file.

## Prerequisites

- Node.js installed
- An account with monday.com
- Google Chrome installed

## Setup

1.  Clone this repository.
2.  Install dependencies:

    ```bash
    npm install
    ```
3.  Create a `.env` file based on `.env.example` and fill in the required values:

    ```
    MONDAY_LOGIN_URL="https://auth.monday.com/auth/login_monday"
    API_TOKEN=your_api_token_here
    API_URL=https://api.monday.com/v2
    BOARD_ID=your_board_id_here
    MONDAY_DOC_COLUMN_ID=your_column_id_here
    ITEMS_PAGE_LIMIT=100
    ```

    -   `MONDAY_LOGIN_URL`: The URL for the monday.com login page.
    -   `API_TOKEN`: Your monday.com API token.
    -   `API_URL`: The monday.com API endpoint.
    -   `BOARD_ID`: The ID of the board you want to scrape.
    -   `MONDAY_DOC_COLUMN_ID`: (Optional) The ID of the monday Doc column. If not specified, the script will use the first monday Doc column found on the board.
    -   `ITEMS_PAGE_LIMIT`: (Optional) The number of items to retrieve per page. Default is 100.

## Usage

### 1. Login and Save Cookies

First, you need to log in to monday.com and save the cookies to a file. Run the following command:

```bash
npm run login
```

This will launch a Chrome browser in debug mode. Log in to your monday.com account. After logging in, wait a few seconds and close the browser. The cookies will be saved to `cookies.json`.

### 2. Scrape Doc Contents

After saving the cookies, you can scrape the content from the monday Doc columns and export it to a CSV file. Run the following command:

```bash
npm run scrape
```

This will scrape the content from all monday Doc columns on the specified board and save it to `output.csv`. The CSV file will be encoded in Shift_JIS.

## Scripts

The `package.json` file contains the following scripts:

-   `biome:check:write`: Runs Biome to check and format the code.
-   `login`: Logs in to monday.com and saves the cookies.
-   `scrape`: Scrapes the content from monday Doc columns and exports it to a CSV file.

## Dependencies

-   `axios`: For making HTTP requests to the monday.com API.
-   `csv-stringify`: For converting data to CSV format.
-   `dotenv`: For loading environment variables from a `.env` file.
-   `iconv-lite`: For encoding the CSV file to Shift_JIS.
-   `puppeteer`: For automating Chrome to log in and scrape the Doc contents.

## Dev Dependencies

-   `@biomejs/biome`: For code formatting and linting.
-   `@types/node`: For TypeScript type definitions for Node.js.
-   `ts-node`: For running TypeScript files directly.
-   `typescript`: For TypeScript compilation.
