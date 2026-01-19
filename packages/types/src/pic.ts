export type MonitoringStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OFFLINE';

export interface DNPMonitoring {
  id: string;
  name: string;
  location: string;
  status: MonitoringStatus;
  type?: string;
  data?: Record<string, any>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
