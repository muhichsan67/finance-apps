import type { SystemSettingRepository } from "@/core/domain/system-setting";

export class DeleteSystemSettingUseCase {
  constructor(private readonly repository: SystemSettingRepository) {}
  async execute(id: number, actorUserId: string) {
    await this.repository.softDeleteSetting(id, actorUserId);
  }
}
