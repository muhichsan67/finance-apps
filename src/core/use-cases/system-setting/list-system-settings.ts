import type { SystemSettingRepository } from "@/core/domain/system-setting";

export class ListSystemSettingsUseCase {
  constructor(private readonly repository: SystemSettingRepository) {}
  async execute() {
    return this.repository.listActiveSettings();
  }
}
