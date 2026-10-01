export interface PrivacyPreferences {
  showContact: boolean;
  showInSearch: boolean;
}

export interface DeviceSession {
  id: string;
  device: string;
  lastActive: string;
  current: boolean;
}
