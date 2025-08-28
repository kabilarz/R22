// Test script to check API client URL detection
console.log('=== API CLIENT URL TEST ===');

// Simulate desktop environment
console.log('Window object exists:', typeof window !== 'undefined');
console.log('Tauri object exists:', typeof window !== 'undefined' && typeof (window as any).__TAURI__ !== 'undefined');

// Check environment detection
const isTauriEnvironment = typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined;
const isStaticExport = typeof window !== 'undefined' && window.location.protocol === 'file:';

console.log('Environment detection:', {
  isTauriEnvironment,
  isStaticExport,
  protocol: window.location.protocol,
  hostname: window.location.hostname,
  origin: window.location.origin
});

// Test API URL logic (same as in api.ts)
const API_BASE_URL = (isTauriEnvironment || isStaticExport)
  ? 'http://localhost:8001/api'  // Desktop always uses localhost
  : process.env.NODE_ENV === 'production' 
    ? 'https://statwise-ai-2.preview.emergentagent.com/api'
    : 'http://localhost:8001/api';

console.log('Final API Base URL:', API_BASE_URL);

// Test actual fetch
console.log('Testing fetch to:', API_BASE_URL + '/health');

fetch(API_BASE_URL + '/health')
  .then(response => {
    console.log('Fetch response:', {
      status: response.status,
      ok: response.ok,
      url: response.url
    });
    return response.json();
  })
  .then(data => {
    console.log('✅ SUCCESS - Backend responded:', data);
  })
  .catch(error => {
    console.error('❌ FAILED - Backend error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
  });