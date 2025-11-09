# Project State (as of 2025-07-04): Westgate Lending Analytics Dashboard

## 1. Main Goal

The primary goal of this project is to provide a dashboard for visualizing and analyzing loan data, focusing on default and refusal risk scores, historical decisions, and simulating the impact of different risk thresholds on loan acceptance rates.

## 2. Core Features Implemented So Far

- Fetching loan data from a Supabase database, including pagination to retrieve all records within a selected date range.
- Displaying key aggregate statistics (Total Loans, Accepted, Refused, Accept Rate).
- Presenting monthly trends of loan decisions through charts and tables.
- Three analysis modes:
  - **Historical Analysis**: Shows actual historical loan decisions from the database.
  - **Simulation Mode**: Allows users to adjust Default and Refusal Score thresholds to see the simulated impact on acceptance/refusal rates.
  - **Threshold Grid Analysis**: Visualizes the Accept Rate across a 2D grid of varying Default and Refusal Score thresholds (0.00 to 1.00 in 0.05 increments) using color formatting (heatmap style).
- Interactive Threshold Grid cells: Clicking a cell in the Threshold Grid sets the corresponding Default and Refusal thresholds and automatically switches the view to Simulation Mode.
- Date range filtering for all analysis modes, with a custom date range picker component.
- Visual loading indicators: A full-screen loader for initial data fetch and a subtle overlay/cursor indicator for data refreshing triggered by date range changes.

## 3. Technologies/Frameworks Used

- React (with Hooks: `useState`, `useEffect`, `useMemo`)
- TypeScript
- Supabase (for database interaction and data fetching)
- Tailwind CSS (for styling)
- Lucide React (for icons)

## 4. Key Files and Their Roles

- [`src/components/Dashboard.tsx`](src/components/Dashboard.tsx): The main application component. Manages global state (view mode, date range, thresholds, loading), orchestrates data fetching from Supabase, performs client-side data processing (filtering, aggregation), and renders the appropriate view (Historical, Simulation, Threshold Grid) and shared controls.
- [`src/lib/supabase.ts`](src/lib/supabase.ts): Configures the Supabase client and defines the `LoanRecord` TypeScript interface for data structure.
- [`src/components/DateRangePicker.tsx`](src/components/DateRangePicker.tsx): Component for selecting start and end dates. Includes standard date inputs and "Quick Select" buttons. Modified to include separate year/month/day selectors for more granular control and displays a loading cursor when data is refreshing.
- [`src/components/ThresholdMatrix.tsx`](src/components/ThresholdMatrix.tsx): New component responsible for computing and rendering the 2D grid visualization of Accept Rate based on varying thresholds. Handles cell clicks to trigger threshold updates in the Dashboard component and highlights the currently selected cell.
- [`src/config/dataSource.ts`](src/config/dataSource.ts): Contains configuration for using mock data and the mock data generation logic.
- Other components (`MetricsCard.tsx`, `MonthlyChart.tsx`, `StatsTable.tsx`, `ThresholdControls.tsx`) handle specific UI elements within the dashboard views.

## 5. Database Schema

The main table used is `logs` in Supabase, with the following relevant columns:

| Column Name      | Type                | Description                                 |
|------------------|---------------------|---------------------------------------------|
| id               | integer/uuid        | Primary key                                 |
| created_at       | timestamptz         | Timestamp of loan record creation           |
| default_score    | float (nullable)    | Model's default risk score                  |
| refusal_score    | float (nullable)    | Model's refusal risk score                  |
| decision         | string (nullable)   | Historical decision (e.g., "accept", "refuse") |
| organization     | string (nullable)   | Organization associated with the loan       |
| info             | string (nullable)   | Additional info (JSON or text)              |

- The dashboard queries only records where `default_score` and `refusal_score` are not null.
- Date filtering is performed on the `created_at` column using ISO 8601 strings and Supabase's `.gte()` and `.lte()` query methods.
- The schema is reflected in the `LoanRecord` TypeScript interface in `src/lib/supabase.ts`.

## 6. What I Was Working on Last, and Next Planned Steps

- **Last Work**: Improved the visibility of the threshold labels (row and column headers) in the Threshold Grid table by changing their text color from black to a subtle cyan.
- **Next Planned Steps**: The last requested change was completed. The project is ready for your next instruction. Potential next steps could involve refining the UI/UX further, adding more metrics to the Threshold Grid (e.g., Refuse Rate), or implementing additional analysis features.

## 7. Context Needed to Understand Tricky Parts or Design Decisions

- **Date Handling**: Initial issues with date filtering were resolved by implementing server-side filtering in the Supabase query using ISO 8601 formatted dates (`gte`, `lte`) and ensuring the date range includes the full start and end days. Pagination was added to overcome the default Supabase record limit. The `DateRangePicker` was enhanced with individual selectors to address the native date picker's behavior of auto-selecting a day when the month changes.
- **Loading States**: Two distinct loading states (`loading` and `dataRefreshing`) were introduced to differentiate between the initial full-page load and subsequent data fetches (like changing the date range), allowing for different visual feedback mechanisms (full-screen loader vs. subtle overlay/cursor).
- **Threshold Grid Interaction**: The decision to make grid cells clickable provides a direct and intuitive way for users to explore the impact of different thresholds and immediately see the results in the Simulation mode, enhancing the analytical workflow. Highlighting the selected cell provides clear visual context.

## 8. Authentication System (Added 2025-07-09)

A login system has been implemented to restrict access to the dashboard, ensuring only authorized users can view the analytics data:

- **Login Screen**: A new login page requires users to enter valid credentials before accessing the dashboard.
- **Authentication Flow**:
  - Credentials are validated against environment variables (VITE_USERNAME and VITE_PASSWORD)
  - Default fallback credentials (admin/password) are used if environment variables aren't set
  - Authentication state is persisted in localStorage, allowing users to remain logged in between sessions
  - A logout button in the top-right corner allows users to securely log out

### Key Files Added/Modified:

- [`src/components/Login.tsx`](src/components/Login.tsx): New component that renders the login form, handles credential validation, and provides feedback on authentication attempts.
- [`src/App.tsx`](src/App.tsx): Modified to implement authentication state management and conditionally render either the Login component or Dashboard based on authentication status.
- [`.env`](.env): Added to store username and password credentials (included in .gitignore for security).

### Design Decisions:

- **Simple Authentication**: Implemented a straightforward username/password authentication system as requested, with credentials stored in environment variables.
- **Persistent Sessions**: Used localStorage to maintain authentication state between page refreshes, improving user experience.
- **Security Considerations**: Ensured .env file is included in .gitignore to prevent credential exposure in version control.
- **Consistent UI**: Styled the login screen to match the existing dashboard aesthetic, using the same color scheme and visual language.

## How it works

The application follows a standard React-based architecture. Here's a breakdown of the workflow:

1.  **Initialization**: The application starts by rendering the `App` component.
2.  **Authentication**: The `App` component checks for an authentication token in `localStorage`. If a token is found, it renders the `Dashboard` component; otherwise, it displays the `Login` component.
3.  **Data Fetching**: Once the `Dashboard` component is rendered, it fetches loan data from the Supabase backend. The data is filtered by the selected date range.
4.  **State Management**: The `Dashboard` component manages the application's state, including the current view mode, date range, and risk thresholds.
5.  **User Interaction**: Users can interact with the dashboard by changing the view mode, adjusting the date range, or modifying the risk thresholds.
6.  **Data Visualization**: The application uses various components to visualize the data, including `MetricsCard`, `MonthlyChart`, and `StatsTable`.
7.  **Simulation**: In "Simulation Mode," the application recalculates the loan decisions based on the user-defined risk thresholds.
8.  **Threshold Grid**: The "Threshold Grid" provides a visual representation of how different threshold combinations affect the acceptance rate.