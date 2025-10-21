# Dynamic SQL Function Runner

A web application that provides a dynamic form interface for executing SQL functions. The application consists of a Vue.js frontend and Node.js backend, allowing users to select and execute SQL functions with custom parameters and filters.

## Features

- 🔄 Dynamic form generation based on function parameters
- 📊 Support for various parameter types (date, int, decimal, text)
- 🎯 Easy function selection from a predefined list
- ⚡ Real-time form updates
- 🎨 Modern and responsive UI with Tailwind CSS
- 🔒 Backend API with Express.js

## Project Structure

```
├── backend/
│   ├── functions.json    # SQL function definitions
│   ├── package.json      # Backend dependencies
│   └── server.js         # Express server implementation
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── DynamicFunctionForm.vue  # Main form component
    │   ├── App.vue       # Root Vue component
    │   ├── index.css     # Global styles
    │   └── main.js       # Vue application entry
    ├── index.html        # HTML entry point
    ├── package.json      # Frontend dependencies
    ├── postcss.config.js # PostCSS configuration
    ├── tailwind.config.js# Tailwind CSS configuration
    └── vite.config.js    # Vite build configuration
```

## Technology Stack

- **Frontend:**
  - Vue.js 3
  - Tailwind CSS
  - Vite

- **Backend:**
  - Node.js
  - Express.js
  - CORS enabled

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```
The server will run on port 4000 by default.

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

## Usage

1. Select a function from the dropdown menu
2. Fill in the required parameters
3. (Optional) Add filters if needed
4. Submit the form to execute the function
5. View the results

## API Endpoints

- `GET /api/functions` - Retrieve list of available functions
- `POST /api/executeFunction` - Execute a function with parameters and filters

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.