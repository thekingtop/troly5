
import type { SavedCase } from '../types.ts';

// Declare global Dexie to satisfy TypeScript since it's loaded from CDN
declare var Dexie: any;

class LegalAssistantDB extends Dexie {
  // 'cases' is the name of our table.
  // We use `any` here for simplicity and to avoid potential conflicts with the
  // global Dexie object provided by the CDN script. The public methods of this
  // service will still provide type safety to the rest of the application.
  cases: any; 

  constructor() {
    super('LegalAssistantDB');
    this.version(2).stores({
      // Primary key is 'id'.
      // The other strings are indexes, which will speed up queries on these properties.
      cases: 'id, name, updatedAt, workflowType' 
    });
    // Explicitly initialize the table property for clarity and correctness.
    this.cases = this.table('cases');
  }
}

const db = new LegalAssistantDB();

// --- CRUD Operations ---

/**
 * Fetches all saved cases from the database, sorted by the last update time in descending order.
 * @returns A promise that resolves to an array of SavedCase objects.
 */
export const getAllCasesSorted = (): Promise<SavedCase[]> => {
  return db.cases.orderBy('updatedAt').reverse().toArray();
};

/**
 * Adds or updates a case in the database using its primary key.
 * @param caseData The SavedCase object to save.
 * @returns A promise that resolves with the ID of the saved case.
 */
export const saveCase = (caseData: SavedCase): Promise<string> => {
  return db.cases.put(caseData);
};

/**
 * Deletes a case from the database by its ID.
 * @param caseId The ID of the case to delete.
 * @returns A promise that resolves when the case has been deleted.
 */
export const deleteCaseById = (caseId: string): Promise<void> => {
  return db.cases.delete(caseId);
};

/**
 * Adds multiple cases to the database in a single transaction.
 * This is more efficient than adding them one by one.
 * @param casesData An array of SavedCase objects to add.
 * @returns A promise that resolves when all cases have been added.
 */
export const bulkAddCases = (casesData: SavedCase[]): Promise<string> => {
  return db.cases.bulkAdd(casesData);
}

/**
 * Atomically clears the entire 'cases' table and then adds new cases.
 * This is used for restoring data from a backup.
 * @param casesData An array of SavedCase objects to restore.
 * @returns A promise that resolves when the restore is complete.
 */
export const clearAndBulkAddCases = (casesData: SavedCase[]): Promise<string> => {
  return db.transaction('rw', db.cases, async () => {
    await db.cases.clear();
    // Validate that casesData is an array before adding
    if (!Array.isArray(casesData)) {
      throw new Error("Invalid data format for restore: Expected an array of cases.");
    }
    return await db.cases.bulkAdd(casesData);
  });
};

// Export the db instance itself if direct, more complex queries are needed.
export { db };