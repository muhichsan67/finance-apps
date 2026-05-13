import type { CategoryRepository } from "@/core/domain/category";

export class DeleteCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(id: number, actorUserId: string) {
    await this.repository.softDeleteCategory(id, actorUserId);
  }
}
