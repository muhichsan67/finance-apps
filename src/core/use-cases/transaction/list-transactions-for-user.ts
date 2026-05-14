import type {
  TransactionListPage,
  TransactionListQuery,
  TransactionRepository,
} from "@/core/domain/transaction";

export class ListTransactionsForUserUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  execute(query: TransactionListQuery): Promise<TransactionListPage> {
    return this.repository.listForUserPaged(query);
  }
}
