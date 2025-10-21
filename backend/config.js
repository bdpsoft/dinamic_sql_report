export const config = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID || '',
        clientSecret: process.env.AZURE_CLIENT_SECRET || '',
        tenantId: process.env.AZURE_TENANT_ID || '',
        authority: process.env.AZURE_AUTHORITY || `https://login.microsoftonline.com/common`,
        redirectUri: process.env.REDIRECT_URI || 'http://localhost:4000/auth/callback',
        scopes: ['user.read', 'profile', 'email']
    },
    apiConfig: {
        uri: process.env.API_URI || 'http://localhost:4000'
    }
};