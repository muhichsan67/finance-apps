import type { UsersRepository } from "@/core/domain/profile-user";

export class ListUsersUseCase {
  constructor(private readonly repository: UsersRepository) {}
  async execute() {
    return this.repository.listActiveUsers();
  }
}
