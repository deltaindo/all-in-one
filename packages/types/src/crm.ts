export type ContactStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'UNSUBSCRIBED';
export type CampaignType = 'EMAIL' | 'WHATSAPP' | 'SMS' | 'BOTH';
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface CRMContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  company?: string;
  tags: string[];
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMCampaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  content: string;
  totalSent: number;
  totalSuccess: number;
  totalFailed: number;
  createdAt: Date;
  updatedAt: Date;
}
