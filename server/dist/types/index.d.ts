export interface ApiResponse<T = any> {
    code: number;
    data: T;
    msg: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T> {
    total?: number;
    page?: number;
    pageSize?: number;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    user: {
        id: number;
        username: string;
        role: string;
        name?: string;
    };
}
export interface CreateCategoryRequest {
    name: string;
    nameEn?: string;
    hasWhitelist?: boolean;
    needRsaApproval?: boolean;
    needLegalReview?: boolean;
    remark?: string;
    description?: string;
}
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
    id: number;
}
export interface CreateProductRequest {
    name: string;
    packageName?: string;
    packageSize?: string;
    categoryId?: number;
    targetCountries?: string;
    shelfStatus?: string;
    attributionWindow?: number;
    gpLink?: string;
    gaLink?: string;
    gpRating?: number;
    settlementType?: string;
    submitterName?: string;
}
export interface UpdateProductRequest extends Partial<CreateProductRequest> {
    id: number;
}
export interface ApprovalActionRequest {
    action: 'approve' | 'reject';
    comment?: string;
    approvedCategoryId?: number;
}
export interface JwtPayload {
    userId: number;
    username: string;
    role: string;
    roles: string[];
}
export type UserRole = 'admin' | 'auditor' | 'operator' | 'category';
export type ProductStatus = 'pending' | 'in_progress' | 'approved' | 'rejected';
export type ApprovalStatus = 'pending' | 'in_progress' | 'approved' | 'rejected';
export type SettlementType = 'CPA' | 'CPI' | 'Subscription' | 'Other';
//# sourceMappingURL=index.d.ts.map