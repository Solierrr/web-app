import type { SolarPanelAnnouncement } from "@/domain/models/announcemnt/solarPanelAnnouncement";
import type { Company } from "@/domain/models/entities/company";
import type { User } from "@/domain/models/entities/user";

import solarPanelAnnouncements from "./products/solarPanel.json";
import companies from "./entities/company.json";
import users from "./entities/company.json";

export const solarPanelAnnouncementMocks =
  solarPanelAnnouncements as SolarPanelAnnouncement[];
export const companyMocks = companies as Company[];
// export const userMocks = users as User[];
