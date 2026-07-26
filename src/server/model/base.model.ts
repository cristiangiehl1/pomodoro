import { db as defaultDb } from "@/server/db/client";

export type Database = typeof defaultDb;

/**
 * Base dos modelos (repositórios) de entidade.
 *
 * Instanciável: `new TaskModel()` usa a conexão compartilhada; passe uma
 * instância de `db` (ou uma transação) para injeção em testes ou para operar
 * dentro de uma transação externa.
 */
export abstract class BaseModel {
  protected readonly db: Database;

  constructor(db: Database = defaultDb) {
    this.db = db;
  }
}
