import type { SolarPanelAnnouncement } from "@/features/products/solar-panel/solarPanelAnnouncement";
import type { Company } from "@/features/companies/company";
import type { User } from "@/features/users/user/user";
import type { Professional } from "@/features/professionals/professional";

import solarPanelAnnouncements from "@/features/products/solar-panel/solarPanelAnnouncement.d.mock";
import companies from "@/features/companies/company.d.mock";
import users from "@/features/users/user/user.d.mock";
import professionals from "@/features/professionals/professional.d.mock";

export const solarPanelAnnouncementMocks = solarPanelAnnouncements as SolarPanelAnnouncement[];
export const companyMocks = companies as Company[];
export const userMocks = users as User[];
export const professionalMocks = professionals as Professional[];
