// ProjectMember model interfaces

export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  role: MemberRole;
  joinedAt: Date;
}

export enum MemberRole {
  OWNER = 'OWNER',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export interface ProjectMemberCreateInput {
  projectId: number;
  userId: number;
  role?: MemberRole;
}

export interface ProjectMemberUpdateInput {
  role?: MemberRole;
}

export interface ProjectMemberResponse {
  id: number;
  projectId: number;
  userId: number;
  role: MemberRole;
  joinedAt: Date;
}
