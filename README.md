# Expense Tracker Web Application

## Project Overview

The Expense Tracker is a web-based application designed to help users manage and monitor their personal expenses and income in an organized way.

The application allows users to record financial transactions, categorize expenses, view monthly spending patterns, and analyze their financial activity through interactive charts. It also provides features for setting budgets and generating reports.

## Main Features

- Add and manage income and expenses
- Categorize transactions
- View total income, expenses, and balance
- Analyze expenses category-wise
- View monthly expense statistics
- Interactive charts and visual analytics
- Set and monitor budget limits
- Generate and download expense reports
- User authentication and account management
- Store financial data securely in the database
- Responsive interface for different screen sizes

## Technologies Used

The project is developed using the following technologies:

- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Build Tool:** Vite
- **Database:** Supabase
- **Charts:** Chart.js
- **Backend/API:** Node.js
- **Development Environment:** Visual Studio Code

## Project Structure

The project is organized into separate components and modules to make the application easier to maintain and modify.

```text
src/
├── components/      # Reusable interface components
├── pages/            # Application pages
├── hooks/            # Custom React hooks
├── services/         # Data and API-related functions
├── lib/              # Utility functions and configuration
├── assets/           # Images and other static resources
└── main.tsx          # Application entry point
```

## Installation and Setup

### 1. Install Node.js

Make sure Node.js and npm are installed on your computer.

You can verify the installation using:

```sh
node -v
npm -v
```

### 2. Install Project Dependencies

Open the project folder in a terminal and run:

```sh
npm install
```

This installs the packages required to run the application.

### 3. Start the Development Server

Run:

```sh
npm run dev
```

The development server will start and provide a local URL that can be opened in a web browser.

## Database Configuration

The application uses Supabase for storing user and financial data.

The required database configuration should be added through environment variables rather than directly inside the source code.

Example:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not share private keys or sensitive credentials publicly.

## How the Application Works

1. The user signs in to the application.
2. Income and expense transactions can be added.
3. Each transaction can be assigned to an appropriate category.
4. The application calculates the user's financial summary.
5. Transaction data is displayed using tables and charts.
6. Monthly and category-wise spending can be analyzed.
7. Users can set budget limits and monitor their spending.
8. Reports can be generated from the stored transaction data.

## Purpose of the Project

The main purpose of this project is to provide a simple and practical solution for managing personal finances digitally.

It demonstrates the use of modern web-development technologies, database integration, authentication, data visualization, and responsive user-interface design in a single application.

## Running the Project

After completing the setup, use:

```sh
npm run dev
```

Then open the local development address displayed in the terminal.

## Future Improvements

Possible future improvements include:

- Mobile application support
- Advanced financial statistics
- Recurring transactions
- Automatic expense reminders
- Exporting reports in multiple formats
- Improved security and authentication
- Integration with external financial services
