import type {
  SystemSettingRepository,
  UpsertSystemSettingInput,
} from "@/core/domain/system-setting";

export class UpsertSystemSettingUseCase {
  constructor(private readonly repository: SystemSettingRepository) {}
  async execute(input: UpsertSystemSettingInput) {
    await this.repository.upsertSetting(input);
  }
}
