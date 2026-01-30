import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App.jsx'
import MapPage from './MapPage.jsx'

// Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

// Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  console.warn('Missing VITE_CLERK_PUBLISHABLE_KEY - auth features will be disabled')
}

function AppWithProviders() {
  // If no Clerk key, render without auth
  if (!clerkPubKey) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/map" element={<MapPage />} />
          </Routes>
        </BrowserRouter>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWithProviders />
  </StrictMode>,
)
