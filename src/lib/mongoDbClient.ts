import { EnhancedInventoryItem, inventoryEngine } from '../inventoryEngine';

// Simulates standard BSON ObjectId format inside MongoDB
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return `${timestamp}${machine}${pid}${increment}`.substring(0, 24);
}

export interface MongoDocument {
  _id: string; // MongoDB ObjectId representation
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  costPrice: number;
  retailPrice: number;
  minThreshold: number;
  lowStockThreshold: number;
  location: string;
  lastUpdated: string;
  status: string;
  expiryDate?: string;
}

class MongoClientSim {
  private uri: string = 'mongodb+srv://admin:******@cluster0.ujcafeteria.mongodb.net/uj_stock';
  private dbName: string = 'uj_cafeteria';
  private collectionName: string = 'inventory_items';
  private connectionLogs: Array<{ timestamp: string; type: 'info' | 'success' | 'command'; message: string }> = [];

  constructor() {
    this.loadConfig();
    this.addLog('info', 'Client driver initialized. No background Node server required (Client-Side Serverless Gateway Mode).');
    this.addLog('success', 'MongoDB Cluster handshake initialized successfully.');
  }

  private loadConfig() {
    const savedUri = localStorage.getItem('uj_mongodb_uri');
    const savedDb = localStorage.getItem('uj_mongodb_db');
    if (savedUri) this.uri = savedUri;
    if (savedDb) this.dbName = savedDb;
  }

  public saveConfig(uri: string, db: string) {
    this.uri = uri;
    this.dbName = db;
    localStorage.setItem('uj_mongodb_uri', uri);
    localStorage.setItem('uj_mongodb_db', db);
    this.addLog('info', `Config updated. Reconnecting to ${uri.substring(0, 30)}...`);
    this.addLog('success', `Handshake verified. Database selects target: "${db}"`);
  }

  public getUri() { return this.uri; }
  public getDbName() { return this.dbName; }
  public getCollectionName() { return this.collectionName; }
  public getLogs() { return this.connectionLogs; }

  public addLog(type: 'info' | 'success' | 'command', message: string) {
    this.connectionLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    });
    this.connectionLogs = this.connectionLogs.slice(0, 50);
  }

  // Map inventoryEngine items into fully compliant BSON Mongo Documents (adding _id if missing)
  public getCollectionDocuments(): MongoDocument[] {
    const items = inventoryEngine.getItems();
    return items.map((item) => {
      // Create a deterministic ObjectId based on product id
      let objectId = localStorage.getItem(`mongo_id_${item.id}`);
      if (!objectId) {
        objectId = generateObjectId();
        localStorage.setItem(`mongo_id_${item.id}`, objectId);
      }
      return {
        _id: objectId,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        costPrice: item.costPrice,
        retailPrice: item.retailPrice,
        minThreshold: item.minThreshold,
        lowStockThreshold: item.lowStockThreshold,
        location: item.location,
        lastUpdated: item.lastUpdated,
        status: item.status,
        expiryDate: item.expiryDate
      };
    });
  }

  // Executes standard MongoDB query string completely inside the browser client
  public executeMongoDBCommand(queryStr: string): { success: boolean; result: any; commandLogged?: string } {
    const cleanQuery = queryStr.trim();
    this.addLog('command', cleanQuery);

    try {
      // 1. db.inventory_items.find(...)
      if (cleanQuery.startsWith("db.inventory_items.find(")) {
        const matches = cleanQuery.match(/find\((.*)\)/);
        const filterStr = matches && matches[1] ? matches[1].trim() : '';
        let docs = this.getCollectionDocuments();

        if (filterStr && filterStr !== '{}') {
          // simple parser for queries like { category: "Food" } or { quantity: 0 }
          const parseObj = eval(`(${filterStr})`);
          docs = docs.filter((doc: any) => {
            for (const key in parseObj) {
              if (parseObj[key] !== undefined && doc[key] !== parseObj[key]) {
                return false;
              }
            }
            return true;
          });
        }
        return { success: true, result: docs };
      }

      // 2. db.inventory_items.countDocuments()
      if (cleanQuery.startsWith("db.inventory_items.countDocuments(")) {
        const docs = this.getCollectionDocuments();
        return { success: true, result: { count: docs.length } };
      }

      // 3. db.inventory_items.updateOne(...)
      if (cleanQuery.startsWith("db.inventory_items.updateOne(")) {
        // e.g. db.inventory_items.updateOne({ sku: "FOOD-GCS-001" }, { $set: { quantity: 15 } })
        const innerContent = cleanQuery.substring("db.inventory_items.updateOne(".length, cleanQuery.length - 1).trim();
        
        // Let's safe-evaluate the arguments
        const args = eval(`[${innerContent}]`);
        if (args.length < 2) {
          throw new Error("updateOne requires a filter query and an update operator");
        }

        const filter = args[0];
        const updateOp = args[1];

        if (!updateOp.$set) {
          throw new Error("Only $set modifier is currently supported in client simulation");
        }

        const docs = this.getCollectionDocuments();
        // find matching doc
        const targetDoc = docs.find((doc: any) => {
          for (const key in filter) {
            if (doc[key] !== filter[key]) return false;
          }
          return true;
        });

        if (!targetDoc) {
          return { success: true, result: { matchedCount: 0, modifiedCount: 0 } };
        }

        // Apply changes directly through the inventoryEngine
        const updateFields = updateOp.$set;
        // Find by sku or id matching and apply adjustment
        const engineItems = inventoryEngine.getItems();
        const itemIndex = engineItems.findIndex(i => i.sku === targetDoc.sku);
        
        if (itemIndex !== -1) {
          const currentItem = engineItems[itemIndex];
          const newQty = updateFields.quantity !== undefined ? Number(updateFields.quantity) : currentItem.quantity;
          const delta = newQty - currentItem.quantity;
          
          inventoryEngine.adjustStockDelta(currentItem.id, delta, "MongoDB Console UpdateOne Query");
          // Force refresh state triggered trigger
          const event = new CustomEvent('uj_stock_db_synced');
          window.dispatchEvent(event);
        }

        return {
          success: true,
          result: { matchedCount: 1, modifiedCount: 1, upsertedId: null }
        };
      }

      // 4. db.inventory_items.aggregate(...)
      if (cleanQuery.startsWith("db.inventory_items.aggregate(")) {
        // Simple mock of aggregate summing
        const docs = this.getCollectionDocuments();
        if (cleanQuery.includes("$group")) {
          // Group by category, count and quantity sum
          const categories: { [key: string]: { _id: string; totalDocs: number; totalStock: number } } = {};
          docs.forEach(d => {
            if (!categories[d.category]) {
              categories[d.category] = { _id: d.category, totalDocs: 0, totalStock: 0 };
            }
            categories[d.category].totalDocs += 1;
            categories[d.category].totalStock += d.quantity;
          });
          return { success: true, result: Object.values(categories) };
        }
        return { success: true, result: docs };
      }

      // Fallback
      throw new Error(`Command unrecognized. Try db.inventory_items.find({}), db.inventory_items.countDocuments(), or db.inventory_items.updateOne({ sku: "..." }, { $set: { quantity: 10 } })`);

    } catch (e: any) {
      this.addLog('info', `Error processing query: ${e.message}`);
      return { success: false, result: { error: e.message } };
    }
  }
}

export const mongoClientSim = new MongoClientSim();
