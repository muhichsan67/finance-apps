import type { CategoryRepository, CreateCategoryInput } from "@/core/domain/category";

export class CreateCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(input: CreateCategoryInput) {
    await this.repository.createCategory(input);
  }
}
