import { MongoClient } from "mongodb";

if (!process.env.DATABASE_URL) {
  throw new Error('Invalid/Missing environment variable: "DATABASE_URL"');
}

const uri = process.env.DATABASE_URL;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Configuração global para ambiente de desenvolvimento para evitar recarregar N conexões no hot-reload
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Produção: Não usamos variável global, abrimos o link e mantemos
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

/**
 * Reusable helper to get a MongoDB collection with pre-configured DB name.
 */
export async function getCollection<T extends import("mongodb").Document>(collectionName: string) {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB;
  const db = client.db(dbName);
  return db.collection<T>(collectionName);
}
