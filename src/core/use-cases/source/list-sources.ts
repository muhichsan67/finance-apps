import type { SourceRepository } from "@/core/domain/source";

export class ListSourcesUseCase {
  constructor(private readonly repository: SourceRepository) {}
  async execute() {
    return this.repository.listActiveSources();
  }
}
