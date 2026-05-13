import type { UsersRepository } from "@/core/domain/profile-user";

export class DeleteUserUseCase {
  constructor(private readonly repository: UsersRepository) {}
  async execute(userId: string) {
    await this.repository.softDeleteUser(userId);
  }
}
