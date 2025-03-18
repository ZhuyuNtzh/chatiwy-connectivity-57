
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { Suspense } from 'react'
import { toast } from 'sonner'

// Error boundary for the root application
try {
  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
        <App />
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
    </div>`;
  }
}
