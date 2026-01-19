export type InventoryStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'RESERVED';
export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGE';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  minimumStock: number;
  unit: string;
  price: number;
  cost?: number;
  status: InventoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  reference?: string;
  notes?: string;
  createdAt: Date;
}
