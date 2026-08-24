import { Route, Routes }   from 'react-router-dom'
// import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout }      from '../components/AppLayout'
import { AboutPage }      from '../pages/AboutPage'
import { HomePage }       from '../pages/HomePage'
import { NotFoundPage }   from '../pages/NotFoundPage'

import SolarPanelAnnouncement from '@/pages/announcement/SolarPanelAnnouncement'
import SolarPanelFeed         from '@/pages/feed/SolarPanelFeed'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index    element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />

        {/* Feed Pages */}
        <Route path="/paineis-solares" element={ <SolarPanelFeed />} />
        <Route path="/profissionais"   element={ <SolarPanelFeed />} />
        
        {/* Search Pages */}
        <Route path="/buscar/paineis-solares" element={<AboutPage />} />
        <Route path="/buscar/profissionais"   element={<AboutPage />} />
        
        {/* Announcemment Page */}
        <Route path="/produto/:id"           element={<SolarPanelAnnouncement />} />
        <Route path="/buscar/profissionais"  element={<AboutPage />} />
        
        {/* Informative Pages */}
        <Route path="/sobre" element={<AboutPage />} />
        <Route path=""       element={<AboutPage />} />
      </Route>
    </Routes>
  )
}
