import type { SolarPanelAnnouncement } from '@/domain/models/announcemnt/solarPanel';
import type { Company } from '@/domain/models/profiles/company';
import type { User } from '@/domain/models/profiles/user';

import solarPanelAnnouncements from './solarPanel.json';
import companies from './company.json';
import users from './users.json';

export const solarPanelAnnouncementMocks = solarPanelAnnouncements as SolarPanelAnnouncement[];
export const companyMocks = companies as Company[];
export const userMocks = users as User[];
