import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateTransactionInput,
  TransactionAttachmentItem,
  TransactionDetail,
  TransactionListItem,
  TransactionListPage,
  TransactionListQuery,
  TransactionRepository,
} from "@/core/domain/transaction";

const ATTACHMENTS_BUCKET = "attachments";

export class SupabaseTransactionRepository implements TransactionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createTransaction(input: CreateTransactionInput): Promise<number> {
    const { data, error } = await this.supabase
      .from("transactions")
      .insert({
        user_id: input.userId,
        category_id: input.categoryId,
        source_id: input.sourceId,
        amount: input.amount,
        transaction_date: input.transactionDate,
        description: input.description,
        created_by: input.actorUserId,
        updated_by: input.actorUserId,
      })
      .select("id")
      .single();

    if (error) throw new Error(`Failed to create transaction: ${error.message}`);
    const rawId = data?.id;
    if (rawId == null) {
      throw new Error("Failed to create transaction: missing id.");
    }
    const id = typeof rawId === "number" ? rawId : Number(rawId);
    if (!Number.isFinite(id)) {
      throw new Error("Failed to create transaction: invalid id.");
    }
    return id;
  }

  async listForUserPaged(query: TransactionListQuery): Promise<TransactionListPage> {
    const page = Math.max(1, query.page);
    const pageSize = Math.min(50, Math.max(1, query.pageSize));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let categoryIds: number[] | null = null;
    if (query.categoryType) {
      const { data: cats, error: catErr } = await this.supabase
        .from("categories")
        .select("id")
        .eq("type", query.categoryType)
        .is("deleted_at", null);
      if (catErr) throw new Error(`Failed to resolve categories: ${catErr.message}`);
      categoryIds = (cats ?? []).map((c) => (typeof c.id === "number" ? c.id : Number(c.id)));
      if (categoryIds.length === 0) {
        return { items: [], total: 0, page, pageSize };
      }
    }

    let q = this.supabase
      .from("transactions")
      .select("id, amount, transaction_date, description, category_id, source_id", { count: "exact" })
      .eq("user_id", query.userId)
      .is("deleted_at", null);

    if (query.dateFrom) q = q.gte("transaction_date", query.dateFrom);
    if (query.dateTo) q = q.lte("transaction_date", query.dateTo);
    if (query.sourceId != null && query.sourceId > 0) q = q.eq("source_id", query.sourceId);
    if (categoryIds) q = q.in("category_id", categoryIds);

    const { data: txs, error, count } = await q
      .order("transaction_date", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);

    if (error) throw new Error(`Failed to load transactions: ${error.message}`);
    const total = count ?? 0;
    if (!txs?.length) {
      return { items: [], total, page, pageSize };
    }

    const ids = txs.map((t) => (typeof t.id === "number" ? t.id : Number(t.id)));
    const catIds = [...new Set(txs.map((t) => t.category_id).filter((x) => x != null))] as number[];
    const srcIds = [...new Set(txs.map((t) => t.source_id).filter((x) => x != null))] as number[];

    const [catsRes, srcsRes, attRes] = await Promise.all([
      catIds.length > 0
        ? this.supabase.from("categories").select("id,name").in("id", catIds)
        : Promise.resolve({ data: [] as { id: number; name: string }[] }),
      srcIds.length > 0
        ? this.supabase.from("sources").select("id,name").in("id", srcIds)
        : Promise.resolve({ data: [] as { id: number; name: string }[] }),
      ids.length > 0
        ? this.supabase.from("transaction_attachments").select("transaction_id").in("transaction_id", ids)
        : Promise.resolve({ data: [] as { transaction_id: number }[] }),
    ]);

    const catMap = new Map((catsRes.data ?? []).map((c) => [c.id, c.name]));
    const srcMap = new Map((srcsRes.data ?? []).map((s) => [s.id, s.name]));
    const countMap = new Map<number, number>();
    for (const row of attRes.data ?? []) {
      const tid =
        typeof row.transaction_id === "number"
          ? row.transaction_id
          : Number(row.transaction_id);
      if (!Number.isFinite(tid)) continue;
      countMap.set(tid, (countMap.get(tid) ?? 0) + 1);
    }

    const items: TransactionListItem[] = txs.map((t) => {
      const id = typeof t.id === "number" ? t.id : Number(t.id);
      const categoryId = t.category_id != null ? (t.category_id as number) : null;
      const sourceId = t.source_id != null ? (t.source_id as number) : null;
      return {
        id,
        amount: String(t.amount),
        transactionDate: String(t.transaction_date),
        description: t.description as string | null,
        categoryId,
        sourceId,
        categoryName: categoryId != null ? (catMap.get(categoryId) ?? null) : null,
        sourceName: sourceId != null ? (srcMap.get(sourceId) ?? null) : null,
        attachmentCount: countMap.get(id) ?? 0,
      };
    });

    return { items, total, page, pageSize };
  }

  async softDeleteTransaction(id: number, actorUserId: string): Promise<void> {
    const { error } = await this.supabase
      .from("transactions")
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: actorUserId,
      })
      .eq("id", id)
      .eq("user_id", actorUserId);

    if (error) {
      throw new Error(`Failed to roll back transaction: ${error.message}`);
    }
  }

  async getDetailForUser(userId: string, transactionId: number): Promise<TransactionDetail | null> {
    const { data: tx, error } = await this.supabase
      .from("transactions")
      .select(
        "id, amount, transaction_date, description, category_id, source_id, created_at, updated_at"
      )
      .eq("id", transactionId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new Error(`Failed to load transaction: ${error.message}`);
    if (!tx) return null;

    const categoryId = tx.category_id != null ? (tx.category_id as number) : null;
    const sourceId = tx.source_id != null ? (tx.source_id as number) : null;

    let categoryName: string | null = null;
    if (categoryId != null) {
      const { data: cat, error: catErr } = await this.supabase
        .from("categories")
        .select("name")
        .eq("id", categoryId)
        .maybeSingle();
      if (catErr) throw new Error(`Failed to load category: ${catErr.message}`);
      categoryName = cat?.name ?? null;
    }

    let sourceName: string | null = null;
    if (sourceId != null) {
      const { data: src, error: srcErr } = await this.supabase
        .from("sources")
        .select("name")
        .eq("id", sourceId)
        .maybeSingle();
      if (srcErr) throw new Error(`Failed to load source: ${srcErr.message}`);
      sourceName = src?.name ?? null;
    }

    const { data: attachmentRows, error: attErr } = await this.supabase
      .from("transaction_attachments")
      .select("id, file_path, file_type")
      .eq("transaction_id", transactionId)
      .order("id", { ascending: true });

    if (attErr) throw new Error(`Failed to load attachments: ${attErr.message}`);

    const attachments: TransactionAttachmentItem[] = [];

    for (const row of attachmentRows) {
      const attId = typeof row.id === "number" ? row.id : Number(row.id);
      const filePath = String(row.file_path);
      const fileType = String(row.file_type);
      const { data: signed, error: signErr } = await this.supabase.storage
        .from(ATTACHMENTS_BUCKET)
        .createSignedUrl(filePath, 3600);
      attachments.push({
        id: attId,
        filePath,
        fileType,
        viewUrl: !signErr && signed?.signedUrl ? signed.signedUrl : null,
      });
    }

    return {
      id: typeof tx.id === "number" ? tx.id : Number(tx.id),
      amount: String(tx.amount),
      transactionDate: String(tx.transaction_date),
      description: (tx.description as string | null) ?? null,
      categoryId,
      sourceId,
      categoryName,
      sourceName,
      createdAt: (tx.created_at as string | null) ?? null,
      updatedAt: (tx.updated_at as string | null) ?? null,
      attachments,
    };
  }
}
