export const SOURCE_TYPES = ["cash", "bank", "ewallet", "others"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export interface Source {
  id: number;
  user_id: string | null;
  name: string;
  type: SourceType;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
}

export interface CreateSourceInput {
  name: string;
  type: SourceType;
  actorUserId: string;
}

export interface SourceRepository {
  listActiveSources(): Promise<Source[]>;
  createSource(input: CreateSourceInput): Promise<void>;
  softDeleteSource(id: number, actorUserId: string): Promise<void>;
}
