import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TripProvider } from './contexts/TripContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Login } from './pages/Login'
import { Trips } from './pages/Trips'
import { CreateTrip } from './pages/CreateTrip'
import { Dashboard } from './pages/Dashboard'
import { AuthCallback } from './pages/AuthCallback'

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected routes */}
              <Route
                path="/trips"
                element={
                  <ProtectedRoute>
                    <Trips />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/new"
                element={
                  <ProtectedRoute>
                    <CreateTrip />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:tripId"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Redirect root to trips list */}
              <Route path="/" element={<Navigate to="/trips" replace />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/trips" replace />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </TripProvider>
    </AuthProvider>
  )
}

export default App
