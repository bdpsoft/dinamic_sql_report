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
- Microsoft 365 tenant with administrative access
- Azure subscription (for app registration)

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

Frontend environment and install notes:

1. Copy the example env file and fill in values:
```powershell
cd frontend
cp .env.example .env
# Edit .env and set VITE_MSAL_CLIENT_ID, VITE_MSAL_AUTHORITY, VITE_MSAL_REDIRECT_URI, VITE_API_URL, VITE_API_SCOPE
```

2. If you encounter dependency resolution errors during `npm install`, try installing with legacy peer deps (this was needed for some dev environments):
```powershell
npm install --legacy-peer-deps
```

### Microsoft 365 Authentication Setup

1. Register the application in Azure AD:
   1. Sign in to the [Azure Portal](https://portal.azure.com)
   2. Navigate to **Azure Active Directory** > **App registrations**
   3. Click **New registration**
   4. Fill in the registration form:
      - **Name**: Dynamic SQL Form Runner (or your preferred name)
      - **Supported account types**: Single tenant (your organization only)
      - **Redirect URI**: Web > http://localhost:4000/auth/callback
   5. Click **Register**

2. Configure the new application:
   1. Note down the following values from the Overview page:
      - **Application (client) ID**
      - **Directory (tenant) ID**
   2. Go to **Certificates & secrets**:
      - Click **New client secret**
      - Add a description and choose expiration
      - **Copy the generated secret value immediately** (it won't be shown again)

3. Set up environment variables:
   1. In the backend folder, create a `.env` file:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   2. Update the `.env` file with your Azure AD credentials:
   ```env
   AZURE_CLIENT_ID=your_application_client_id
   AZURE_CLIENT_SECRET=your_client_secret
   AZURE_TENANT_ID=your_tenant_id
   AZURE_AUTHORITY=https://login.microsoftonline.com/your_tenant_id
   REDIRECT_URI=http://localhost:4000/auth/callback
   API_URI=http://localhost:4000
   SESSION_SECRET=your_random_secret_string
   ```

4. Configure API Permissions in Azure Portal:
   1. In your app registration, go to **API permissions**
   2. Click **Add a permission**
   3. Select **Microsoft Graph**
   4. Choose **Delegated permissions**
   5. Add these permissions:
      - User.Read
      - profile
      - email
   6. Click **Add permissions**
   7. Click **Grant admin consent** (requires admin privileges)

### Azure: SPA + API app registration (recommended)

Follow these steps to register two app registrations in Azure AD: one for the frontend SPA and one for the backend API. This creates a clean separation of concerns and allows the SPA to request access tokens for the API.

1. Register the API app (backend):
   1. In **Azure Portal** > **Azure Active Directory** > **App registrations**, click **New registration**.
   2. Name: `DynamicSQL-API` (or similar).
   3. Supported account types: choose your tenant (Single tenant) or others as appropriate.
   4. Redirect URI: leave blank for the API (not required).
   5. Click **Register**.
   6. In the API app, go to **Expose an API**:
      - Click **Set** next to Application ID URI and accept or customize (e.g., `api://<API_CLIENT_ID>`).
      - Click **Add a scope** and create a scope named `access_as_user` (full scope name will be like `api://<API_CLIENT_ID>/access_as_user`).
      - Make the scope admin-consent display name and description appropriate.

2. Register the SPA app (frontend):
   1. In **App registrations**, click **New registration**.
   2. Name: `DynamicSQL-SPA` (or similar).
   3. Supported account types: your tenant.
   4. Redirect URI: select **Single-page application (SPA)** and enter `http://localhost:5173` (Vite dev server).
   5. Click **Register**.
   6. In the SPA app, go to **Authentication**:
      - Under **Implicit grant and hybrid flows** you don't need to enable anything if using the Authorization Code + PKCE flow (recommended). If you use the MSAL popup approach, ensure your redirect URI is registered.

3. Grant the SPA permission to call the API:
   1. In the SPA app, go to **API permissions** > **Add a permission**.
   2. Select **My APIs** and choose the `DynamicSQL-API` app.
   3. Select the delegated permission `access_as_user` (the scope you created).
   4. Click **Add permissions**.
   5. Click **Grant admin consent** for the tenant (requires admin privileges).

4. Configure client IDs and endpoints in the apps and `.env` files:
   - Backend `.env` should use the API app's client ID and tenant ID where appropriate.
   - Frontend `.env` should use the SPA app's client ID and authority.

5. Ensure MSAL requests the API scope when acquiring tokens. Example scope value for the SPA to request:
```
api://<API_CLIENT_ID>/access_as_user
```

6. Test the flow locally:
   1. Start the backend: `cd backend && npm run dev`
   2. Start the frontend: `cd frontend && npm run dev`
   3. Open `http://localhost:5173`, sign in, and the SPA should request an access token for the API scope.
   4. The SPA sends requests to the backend with `Authorization: Bearer <access_token>`; backend validates with BearerStrategy.

Notes:
- If you use Authorization Code + PKCE (recommended for SPAs), configure MSAL to use the redirect flow instead of popups. The `@azure/msal-browser` library supports both.
- If tokens fail validation, check that the token audience (`aud`) matches the API app registration and that issuer and tenant IDs are correct.
- For production, replace `http://localhost:5173` with your actual hosted SPA URL and update redirect URIs accordingly.

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

1. Access the application through your browser
2. Sign in with your Microsoft 365 account
3. Once authenticated:
   1. Select a function from the dropdown menu
   2. Fill in the required parameters
   3. (Optional) Add filters if needed
   4. Submit the form to execute the function
   5. View the results

### Authentication Flow

1. Users attempting to access the application will be redirected to the Microsoft login page
2. After successful authentication, they will be redirected back to the application
3. The session is maintained until the user logs out or the session expires
4. All API requests require valid authentication tokens

## API Endpoints

### Authentication Endpoints
- `GET /auth/login` - Initiates Microsoft 365 login flow
- `GET /auth/callback` - OAuth2 callback URL for processing authentication
- `GET /auth/user` - Get current authenticated user information

### Protected API Endpoints
- `GET /api/functions` - Retrieve list of available functions (requires authentication)
- `POST /api/executeFunction` - Execute a function with parameters and filters (requires authentication)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.