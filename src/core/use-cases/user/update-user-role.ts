import type { AppRole } from "@/core/domain/auth";
import type { UsersRepository } from "@/core/domain/profile-user";

export class UpdateUserRoleUseCase {
  constructor(private readonly repository: UsersRepository) {}
  async execute(userId: string, role: AppRole) {
    await this.repository.updateUserRole(userId, role);
  }
}
