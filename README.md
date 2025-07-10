# Westgate Lending Analytics Dashboard

## Core Purpose
This React/TypeScript application provides a dashboard for visualizing and analyzing loan data, focusing on default and refusal risk percentiles. It helps users understand historical lending decisions and simulate how different risk thresholds would affect acceptance rates.

## Key Features

1. **Three Analysis Modes**:
   - **Historical Analysis**: Shows actual historical loan decisions from the database
   - **Simulation Mode**: Allows adjusting Default and Refusal Percentile thresholds to see the impact on acceptance rates
   - **Threshold Grid Analysis**: Visualizes Accept Rate across a 2D grid of varying threshold combinations (0 to 100 in 5 percentile increments)

2. **Data Visualization**:
   - Aggregate statistics (Total Loans, Accepted, Refused, Accept Rate)
   - Monthly trends through charts and tables
   - Interactive threshold grid with color-coded cells (heatmap style)

3. **Data Filtering**:
   - Date range selection with custom picker and quick select options
   - Real-time data refreshing with loading indicators

4. **Authentication System**:
   - Login screen requiring username/password
   - Credentials validated against environment variables (VITE_USERNAME/VITE_PASSWORD)
   - Authentication state persisted in localStorage
   - Logout functionality

## Technical Architecture

1. **Frontend Stack**:
   - React with Hooks (useState, useEffect, useMemo)
   - TypeScript for type safety
   - Tailwind CSS for styling
   - Lucide React for icons

2. **Backend Integration**:
   - Supabase for database interaction
   - Pagination to handle large datasets
   - Option to use mock data for development

3. **Key Components**:
   - `App.tsx`: Manages authentication and renders the appropriate view
   - `Dashboard.tsx`: Main component handling state, data fetching, and view rendering
   - `ThresholdMatrix.tsx`: Renders the interactive threshold grid visualization
   - `ThresholdControls.tsx`: Provides sliders for adjusting risk thresholds
   - `DateRangePicker.tsx`: Handles date range selection for filtering
   - `Login.tsx`: Manages authentication flow
   - `supabase.ts`: Configures the Supabase client and defines data structures

4. **Data Flow**:
   - Data is fetched from Supabase based on selected date range
   - Client-side processing for filtering and aggregation
   - Simulation logic applies percentile threshold rules to determine loan decisions (a loan is refused if its default_percentile > default threshold OR refusal_percentile > refusal threshold)
   - Threshold Grid computes acceptance rates for all threshold combinations

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Configuration
1. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_USERNAME=your_username
   VITE_PASSWORD=your_password
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Running the Application
1. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```
2. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Login**: Enter your credentials to access the dashboard
2. **Select Analysis Mode**: Choose between Historical Analysis, Simulation Mode, or Threshold Grid
3. **Filter Data**: Use the Date Range Picker to select the time period for analysis
4. **Adjust Thresholds**: In Simulation Mode, use the sliders to adjust risk percentile thresholds (0-100)
5. **Explore Grid**: In Threshold Grid mode, click on cells to set thresholds and switch to Simulation Mode

## License
This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.