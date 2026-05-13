import type { CategoryRepository } from "@/core/domain/category";

export class ListCategoriesUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute() {
    return this.repository.listActiveCategories();
  }
}
