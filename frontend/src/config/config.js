const config = {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    supabaseUrl: 'https://gmzlqneefjiqtjszzmxl.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtemxxbmVlZmppcXRqc3p6bXhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjQyOTI3MiwiZXhwIjoyMDUyMDA1MjcyfQ.wzwophf7oBOL_VsYkHLRMZkPpCFtGUIOtMh_nPn_cfI',
    isDevelopment: process.env.NODE_ENV === 'development'
};

export default config;