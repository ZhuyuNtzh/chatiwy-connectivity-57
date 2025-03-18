
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { Suspense } from 'react'
import { toast, Toaster } from 'sonner'

// Error boundary for the root application
try {
  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
        <App />
        <Toaster position="top-right" />
      </Suspense>
    </BrowserRouter>
  );
} catch (error) {
  console.error("Error rendering application:", error);
  // Try to render at least a simple error message
  try {
    createRoot(document.getElementById("root")!).render(
      <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Something went wrong</h1>
        <p className="mt-2">Please check your Supabase configuration and try again.</p>
        <p className="mt-4 text-sm text-gray-500">See console for details.</p>
        <div className="mt-6 max-w-md text-left bg-gray-50 p-4 rounded-md border border-gray-200">
          <h2 className="font-semibold mb-2">Quick Fix Steps:</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Create a <code className="bg-gray-100 px-1">.env</code> file in your project root</li>
            <li>Add your Supabase URL: <code className="bg-gray-100 px-1">VITE_SUPABASE_URL=your_url_here</code></li>
            <li>Add your Supabase anon key: <code className="bg-gray-100 px-1">VITE_SUPABASE_ANON_KEY=your_key_here</code></li>
            <li>Restart the development server</li>
          </ol>
        </div>
        <Toaster position="top-right" />
      </div>
    );
    
    // Also show a toast if possible
    setTimeout(() => {
      toast.error("Failed to initialize application. Please check your Supabase configuration.");
    }, 1000);
  } catch {
    // Last resort if even the error display fails
    document.body.innerHTML = `<div style="padding: 20px; text-align: center;">
      <h1 style="color: red;">Application Error</h1>
      <p>The application failed to load. Please check your configuration and try again.</p>
      <div style="margin-top: 20px; text-align: left; max-width: 500px; margin-left: auto; margin-right: auto; background: #f5f5f5; padding: 15px; border-radius: 5px;">
        <h2 style="font-weight: bold; margin-bottom: 10px;">Quick Fix Steps:</h2>
        <ol style="padding-left: 20px;">
          <li>Create a <code style="background: #eee; padding: 2px 4px;">.env</code> file in your project root</li>
          <li>Add your Supabase URL: <code style="background: #eee; padding: 2px 4px;">VITE_SUPABASE_URL=your_url_here</code></li>
          <li>Add your Supabase anon key: <code style="background: #eee; padding: 2px 4px;">VITE_SUPABASE_ANON_KEY=your_key_here</code></li>
          <li>Restart the development server</li>
        </ol>
      </div>
    </div>`;
  }
}
