import type {
  CreateTransactionInput,
  TransactionRepository,
} from "@/core/domain/transaction";

export class CreateTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  execute(input: CreateTransactionInput): Promise<number> {
    return this.repository.createTransaction(input);
  }
}
