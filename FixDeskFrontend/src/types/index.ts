export enum UserRole {
  Admin = 1,
  BranchManager = 2,
  BranchEmployee = 3,
  ITSpecialist = 4,
  FieldEngineer = 5,
  InventoryManager = 6,
}

export const UserRoleNames: Record<UserRole, string> = {
  [UserRole.Admin]: 'Sistem Administratoru',
  [UserRole.BranchManager]: 'Filial Müdiri',
  [UserRole.BranchEmployee]: 'Filial Əməkdaşı',
  [UserRole.ITSpecialist]: 'İT Mütəxəssis',
  [UserRole.FieldEngineer]: 'Sahə Mühəndisi',
  [UserRole.InventoryManager]: 'Anbar Meneceri',
};

export enum TicketStatus {
  New = 1,
  InProgress = 2,
  PendingApproval = 3,
  Resolved = 4,
  Closed = 5,
  Cancelled = 6,
}

export const TicketStatusNames: Record<TicketStatus, string> = {
  [TicketStatus.New]: 'Yeni',
  [TicketStatus.InProgress]: 'İcrada',
  [TicketStatus.PendingApproval]: 'Təsdiq Gözləyir',
  [TicketStatus.Resolved]: 'Həll Olundu',
  [TicketStatus.Closed]: 'Bağlandı',
  [TicketStatus.Cancelled]: 'Ləğv Edildi',
};

export enum TicketPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Urgent = 4,
}

export const TicketPriorityNames: Record<TicketPriority, string> = {
  [TicketPriority.Low]: 'Aşağı (Low)',
  [TicketPriority.Medium]: 'Orta (Medium)',
  [TicketPriority.High]: 'Yüksək (High)',
  [TicketPriority.Urgent]: 'Təcili (Urgent)',
};

export const SlaDurationHours: Record<TicketPriority, number> = {
  [TicketPriority.Urgent]: 2,
  [TicketPriority.High]: 8,
  [TicketPriority.Medium]: 24,
  [TicketPriority.Low]: 48,
};

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole | number;
  roleName?: string;
  branchId?: number;
  branchName?: string;
  isActive?: boolean;
}

export interface Branch {
  id: number;
  name: string;
  code?: string;
  address?: string;
  isActive?: boolean;
  ticketCount?: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
  ticketCount?: number;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  userRole?: string | number;
  commentText: string;
  createdDate: string;
}

export interface TicketAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
}

export interface Ticket {
  id: number;
  ticketCode: string;
  title: string;
  description: string;
  status: TicketStatus | number;
  priority: TicketPriority | number;
  categoryId: number;
  categoryName?: string;
  branchId: number;
  branchName?: string;
  createdUserId: number;
  createdUserName?: string;
  assignedUserId?: number;
  assignedUserName?: string;
  createdDate: string;
  slaDueDate: string;
  isSlaBreached: boolean;
  resolutionNotes?: string;
  resolvedDate?: string;
  comments?: TicketComment[];
  attachments?: TicketAttachment[];
}

export interface KnowledgeBaseArticle {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  categoryName?: string;
  authorName?: string;
  viewCount: number;
  createdDate: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  modelOrSku: string;
  quantity: number;
  unit: string;
  categoryId: number;
  categoryName?: string;
  minQuantityWarning?: number;
  lastUpdatedDate?: string;
}

export interface SpecialistPerformance {
  specialistId: number;
  specialistName: string;
  assignedCount: number;
  resolvedCount: number;
  avgResolutionTimeHours: number;
}

export interface DashboardSummary {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  slaBreachedTickets: number;
  branchStatistics: { branchId: number; branchName: string; count: number }[];
  categoryStatistics: { categoryId: number; categoryName: string; count: number }[];
  specialistPerformances: SpecialistPerformance[];
}

export interface AuthResponse {
  isSuccess: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
}

