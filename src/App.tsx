import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './hooks/useStore'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Practices from './pages/Practices'
import PracticeDetail from './pages/PracticeDetail'
import Invoices from './pages/Invoices'

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/practices" element={<Practices />} />
            <Route path="/practices/:id" element={<PracticeDetail />} />
            <Route path="/invoices" element={<Invoices />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}

export default App
