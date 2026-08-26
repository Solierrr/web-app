import { Route, Routes } from 'react-router-dom'
import { AppLayout }     from '../config/AppLayout'
import { AboutPage }     from '../pages/AboutPage'
import { HomePage }      from '../pages/HomePage'
import { NotFoundPage }  from '../pages/NotFoundPage'

import SolarPanelAnnouncement from '@/pages/announcement/SolarPanelAnnouncement'
import SolarPanelFeed         from '@/pages/feed/SolarPanelFeed'
import EnterpriseProfile      from '@/pages/profile/EnterpriseProfile'

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
       
        {/* Profile Pages */}
        <Route path="/empresa/id" element={<EnterpriseProfile />} />
        {/* <Route path=""       element={<AboutPage />} /> */}
      </Route>
    </Routes>
  )
}
