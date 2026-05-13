import type { CreateSourceInput, SourceRepository } from "@/core/domain/source";

export class CreateSourceUseCase {
  constructor(private readonly repository: SourceRepository) {}
  async execute(input: CreateSourceInput) {
    await this.repository.createSource(input);
  }
}
