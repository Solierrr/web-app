import { Route, Routes } from 'react-router-dom'
import { AppLayout }     from '../config/AppLayout'
import { AboutPage }     from '../pages/AboutPage'
import { HomePage }      from '../pages/HomePage'
import { NotFoundPage }  from '../pages/NotFoundPage'

import SolarPanelAnnouncement from '@/pages/announcement/SolarPanelAnnouncement'
import SolarPanelFeed         from '@/pages/feed/SolarPanelFeed'
import EnterpriseProfile      from '@/pages/profile/EnterpriseProfile'
import LoginPage              from '@/pages/access/LoginPage'
import RegisterPage           from '@/pages/access/RegisterPage'
import ForgotPasswordPage     from '@/pages/access/ForgotPasswordPage'

export function AppRoutes() {
  return (
    <Routes>
      {/* Access Pages */}
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/cadastro"      element={<RegisterPage />} />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />

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
