import type { TransactionListItem, TransactionRepository } from "@/core/domain/transaction";

export class ListTransactionsForUserUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  execute(userId: string): Promise<TransactionListItem[]> {
    return this.repository.listActiveForUser(userId);
  }
}
