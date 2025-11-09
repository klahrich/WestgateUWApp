# Dev Notes: Performance Dashboard Feature (2025-11-09)

This document outlines the steps taken to implement the new "Performance" tab in the Westgate Lending Analytics Dashboard.

## 1. Feature Overview

The goal was to add a new section to the dashboard to visualize historical loan performance data from an external Azure Function endpoint. The key requirement was to display the percentage of the loan principal repaid at 3, 6, and 12 months for different loan cohorts, grouped by the month the loan was released.

## 2. Implementation Steps

### a. Environment Configuration

- A new environment variable, `VITE_AZURE_FUNCTION_CODE`, was added to the `.env` file to store the access code for the Azure Function endpoint.

### b. New Component: `PerformanceDashboard.tsx`

- A new component was created at `src/components/PerformanceDashboard.tsx`.
- This component is responsible for:
    1.  Fetching the performance data from the Azure Function.
    2.  Processing the raw data to aggregate it by month and calculate repayment percentages.
    3.  Displaying the data in a combo chart and a raw data table.
- The `recharts` library was used for charting, which was added as a new project dependency.

### c. Integration into Main Dashboard

- The main `Dashboard.tsx` component was modified to include a new "Performance" view mode.
- A new tab was added to the UI to allow users to switch to this new view.
- The `PerformanceDashboard` component is conditionally rendered when the "Performance" tab is active.

## 3. CORS Issue and Resolution

During development, a Cross-Origin Resource Sharing (CORS) error was encountered. The browser blocked the frontend application (running on `http://localhost:5173`) from fetching data from the Azure Function endpoint (`https://webhookazurefunctionwestgate.azurewebsites.net`).

### a. The Problem

Browsers implement a security feature that restricts web pages from making requests to a different domain than the one that served the page. For the request to succeed, the server at the other domain must include an `Access-Control-Allow-Origin` header in its response, explicitly allowing the origin of the web page.

### b. The Solution

Since this is a development-time issue, the standard solution is to use a proxy. The Vite development server has a built-in proxy feature that was configured to bypass this restriction.

1.  **Proxy Configuration**: The `vite.config.ts` file was modified to add a proxy rule. All requests made from the frontend to `/api` are now automatically forwarded by the Vite server to `https://webhookazurefunctionwestgate.azurewebsites.net`.

    ```typescript
    // vite.config.ts
    server: {
      proxy: {
        '/api': {
          target: 'https://webhookazurefunctionwestgate.azurewebsites.net',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    ```

2.  **Updating the Fetch URL**: The `fetch` request in `PerformanceDashboard.tsx` was updated to use the local proxy path (`/api/...`) instead of the full Azure Function URL.

    ```typescript
    // Before
    fetch(`https://webhookazurefunctionwestgate.azurewebsites.net/api/GetMugaPerformanceFundedRequests?code=${code}`);

    // After
    fetch(`/api/GetMugaPerformanceFundedRequests?code=${code}`);
    ```

This change makes the browser send the request to the Vite server (the same origin), which then forwards it to the actual endpoint. This completely resolves the CORS issue for the local development environment.

**Important Note**: For these changes to take effect, the Vite development server must be restarted after modifying `vite.config.ts`.

## 4. Handling Production vs. Development Environments

The Vite proxy is a development-only feature. To ensure the application works in both development (with the proxy) and production (deployed on a server), we need to use different URLs for the API call.

Vite provides built-in environment variables to handle this:
- `import.meta.env.DEV`: Is `true` when running the `npm run dev` command.
- `import.meta.env.PROD`: Is `true` when running the `npm run build` command.

The code in `PerformanceDashboard.tsx` was updated to use these variables to select the correct URL:

```typescript
const baseUrl = import.meta.env.PROD
  ? 'https://webhookazurefunctionwestgate.azurewebsites.net'
  : '';
const response = await fetch(`${baseUrl}/api/GetMugaPerformanceFundedRequests?code=${code}`);
```

This ensures that the application calls the full, live URL in production and the local, proxied path in development, resolving the 404 error in the deployed environment.