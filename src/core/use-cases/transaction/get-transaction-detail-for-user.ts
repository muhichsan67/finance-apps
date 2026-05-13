import type {
  TransactionDetail,
  TransactionRepository,
} from "@/core/domain/transaction";

export class GetTransactionDetailForUserUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  execute(userId: string, transactionId: number): Promise<TransactionDetail | null> {
    return this.repository.getDetailForUser(userId, transactionId);
  }
}
