import type { SourceRepository } from "@/core/domain/source";

export class DeleteSourceUseCase {
  constructor(private readonly repository: SourceRepository) {}
  async execute(id: number, actorUserId: string) {
    await this.repository.softDeleteSource(id, actorUserId);
  }
}
