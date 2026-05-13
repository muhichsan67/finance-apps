export interface SystemSetting {
  id: number;
  key_name: string;
  value: string;
  setting_group: string | null;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
}

export interface UpsertSystemSettingInput {
  key_name: string;
  value: string;
  setting_group?: string | null;
  actorUserId: string;
}

export interface SystemSettingRepository {
  listActiveSettings(): Promise<SystemSetting[]>;
  upsertSetting(input: UpsertSystemSettingInput): Promise<void>;
  softDeleteSetting(id: number, actorUserId: string): Promise<void>;
}
