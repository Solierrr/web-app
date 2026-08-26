import { AppRoutes } from './routes/AppRoutes'
import ErrorBoundary from '@@/error/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  )
}