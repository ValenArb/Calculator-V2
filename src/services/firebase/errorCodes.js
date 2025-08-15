import { db } from './config';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';

class ErrorCodesService {
  constructor() {
    this.manufacturersCollection = 'manufacturers';
    this.errorCodesCollection = 'errorCodes';
    this.productCodesCollection = 'productCodes';
  }

  // Manufacturers CRUD
  async getAllManufacturers() {
    try {
      const manufacturersRef = collection(db, this.manufacturersCollection);
      const manufacturersQuery = query(manufacturersRef, orderBy('name'));
      const snapshot = await getDocs(manufacturersQuery);
      
      const manufacturers = {};
      snapshot.forEach(doc => {
        manufacturers[doc.id] = {
          id: doc.id,
          ...doc.data()
        };
      });
      
      return manufacturers;
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
      throw error;
    }
  }

  async addManufacturer(manufacturerData) {
    try {
      const manufacturersRef = collection(db, this.manufacturersCollection);
      const manufacturerKey = manufacturerData.name.toLowerCase().replace(/\s+/g, '_');
      
      const manufacturerDoc = {
        name: manufacturerData.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(manufacturersRef, manufacturerKey), manufacturerDoc);
      return manufacturerKey;
    } catch (error) {
      console.error('Error adding manufacturer:', error);
      throw error;
    }
  }

  // Lines CRUD
  async getLinesByManufacturer(manufacturerId) {
    try {
      const linesRef = collection(db, `${this.manufacturersCollection}/${manufacturerId}/lines`);
      const linesQuery = query(linesRef, orderBy('name'));
      const snapshot = await getDocs(linesQuery);
      
      const lines = {};
      snapshot.forEach(doc => {
        lines[doc.id] = {
          id: doc.id,
          ...doc.data()
        };
      });
      
      return lines;
    } catch (error) {
      console.error('Error fetching lines:', error);
      throw error;
    }
  }

  async addLine(manufacturerId, lineData) {
    try {
      const linesRef = collection(db, `${this.manufacturersCollection}/${manufacturerId}/lines`);
      const lineKey = lineData.name.toLowerCase().replace(/\s+/g, '_');
      
      const lineDoc = {
        name: lineData.name,
        hasSubLines: lineData.hasSubLines || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(linesRef, lineKey), lineDoc);
      return lineKey;
    } catch (error) {
      console.error('Error adding line:', error);
      throw error;
    }
  }

  // SubLines CRUD
  async getSubLinesByLine(manufacturerId, lineId) {
    try {
      const subLinesRef = collection(db, `${this.manufacturersCollection}/${manufacturerId}/lines/${lineId}/subLines`);
      const subLinesQuery = query(subLinesRef, orderBy('name'));
      const snapshot = await getDocs(subLinesQuery);
      
      const subLines = {};
      snapshot.forEach(doc => {
        subLines[doc.id] = {
          id: doc.id,
          ...doc.data()
        };
      });
      
      return subLines;
    } catch (error) {
      console.error('Error fetching sublines:', error);
      throw error;
    }
  }

  async addSubLine(manufacturerId, lineId, subLineData) {
    try {
      const subLinesRef = collection(db, `${this.manufacturersCollection}/${manufacturerId}/lines/${lineId}/subLines`);
      const subLineKey = subLineData.name.toLowerCase().replace(/\s+/g, '_');
      
      const subLineDoc = {
        name: subLineData.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(subLinesRef, subLineKey), subLineDoc);
      return subLineKey;
    } catch (error) {
      console.error('Error adding subline:', error);
      throw error;
    }
  }

  // Error Codes CRUD
  async getErrorCodes(manufacturerId, lineId, subLineId = null) {
    try {
      let errorCodesPath;
      if (subLineId) {
        errorCodesPath = `${this.manufacturersCollection}/${manufacturerId}/lines/${lineId}/subLines/${subLineId}/errorCodes`;
      } else {
        errorCodesPath = `${this.manufacturersCollection}/${manufacturerId}/lines/${lineId}/errorCodes`;
      }
      
      const errorCodesRef = collection(db, errorCodesPath);
      const errorCodesQuery = query(errorCodesRef, orderBy('code'));
      const snapshot = await getDocs(errorCodesQuery);
      
      const errorCodes = [];
      snapshot.forEach(doc => {
        errorCodes.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return errorCodes;
    } catch (error) {
      console.error('Error fetching error codes:', error);
      throw error;
    }
  }

  async addErrorCode(manufacturerId, lineId, subLineId = null, errorCodeData) {
    try {
      let errorCodesPath;
      if (subLineId) {
        errorCodesPath = `${this.manufacturersCollection}/${manufacturerId}/lines/${lineId}/subLines/${subLineId}/errorCodes`;
      } else {
        errorCodesPath = `${this.manufacturersCollection}/${manufacturerId}/lines/${lineId}/errorCodes`;
      }
      
      const errorCodesRef = collection(db, errorCodesPath);
      
      const errorCodeDoc = {
        code: errorCodeData.code,
        title: errorCodeData.title,
        description: errorCodeData.description,
        causes: errorCodeData.causes,
        solutions: errorCodeData.solutions,
        severity: errorCodeData.severity,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(errorCodesRef, errorCodeDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error adding error code:', error);
      throw error;
    }
  }

  // Complete structure retrieval
  async getCompleteErrorDatabase() {
    try {
      const manufacturers = await this.getAllManufacturers();
      
      // Get all lines for each manufacturer
      for (const manufacturerId in manufacturers) {
        const lines = await this.getLinesByManufacturer(manufacturerId);
        manufacturers[manufacturerId].lines = lines;
        
        // Get sublines and error codes for each line
        for (const lineId in lines) {
          const line = lines[lineId];
          
          if (line.hasSubLines) {
            const subLines = await this.getSubLinesByLine(manufacturerId, lineId);
            line.subLines = subLines;
            
            // Get error codes for each subline
            for (const subLineId in subLines) {
              const errorCodes = await this.getErrorCodes(manufacturerId, lineId, subLineId);
              subLines[subLineId].errorCodes = errorCodes;
            }
          } else {
            // Get error codes directly for the line
            const errorCodes = await this.getErrorCodes(manufacturerId, lineId);
            line.errorCodes = errorCodes;
          }
        }
      }
      
      return { manufacturers };
    } catch (error) {
      console.error('Error fetching complete error database:', error);
      throw error;
    }
  }

  // Product codes management
  async getAllProductCodes() {
    try {
      const productCodesRef = collection(db, this.productCodesCollection);
      const snapshot = await getDocs(productCodesRef);
      
      const productCodes = {};
      snapshot.forEach(doc => {
        productCodes[doc.id] = doc.data();
      });
      
      return productCodes;
    } catch (error) {
      console.error('Error fetching product codes:', error);
      throw error;
    }
  }

  async addProductCode(productCode, manufacturerId, lineId, subLineId = null) {
    try {
      const productCodesRef = collection(db, this.productCodesCollection);
      
      const productCodeDoc = {
        manufacturer: manufacturerId,
        line: lineId,
        subLine: subLineId,
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(productCodesRef, productCode.toUpperCase()), productCodeDoc);
    } catch (error) {
      console.error('Error adding product code:', error);
      throw error;
    }
  }

  // Initialize with sample data (for first time setup)
  async initializeSampleData() {
    try {
      const batch = writeBatch(db);
      
      // Sample manufacturers
      const sampleManufacturers = [
        { id: 'abb', name: 'ABB' },
        { id: 'siemens', name: 'Siemens' },
        { id: 'schneider', name: 'Schneider Electric' }
      ];
      
      sampleManufacturers.forEach(manufacturer => {
        const manufacturerRef = doc(db, this.manufacturersCollection, manufacturer.id);
        batch.set(manufacturerRef, {
          name: manufacturer.name,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('Sample data initialized successfully');
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  }

  // Search functionality
  async searchErrorCodes(searchTerm) {
    try {
      // This would require a more complex implementation with Algolia or similar
      // For now, we'll fetch all data and filter client-side
      const database = await this.getCompleteErrorDatabase();
      const results = [];
      
      const searchTermLower = searchTerm.toLowerCase();
      
      Object.entries(database.manufacturers).forEach(([manufacturerId, manufacturer]) => {
        Object.entries(manufacturer.lines || {}).forEach(([lineId, line]) => {
          if (line.hasSubLines) {
            Object.entries(line.subLines || {}).forEach(([subLineId, subLine]) => {
              (subLine.errorCodes || []).forEach(errorCode => {
                if (
                  errorCode.code.toLowerCase().includes(searchTermLower) ||
                  errorCode.title.toLowerCase().includes(searchTermLower) ||
                  errorCode.description.toLowerCase().includes(searchTermLower)
                ) {
                  results.push({
                    ...errorCode,
                    manufacturerId,
                    manufacturerName: manufacturer.name,
                    lineId,
                    lineName: line.name,
                    subLineId,
                    subLineName: subLine.name
                  });
                }
              });
            });
          } else {
            (line.errorCodes || []).forEach(errorCode => {
              if (
                errorCode.code.toLowerCase().includes(searchTermLower) ||
                errorCode.title.toLowerCase().includes(searchTermLower) ||
                errorCode.description.toLowerCase().includes(searchTermLower)
              ) {
                results.push({
                  ...errorCode,
                  manufacturerId,
                  manufacturerName: manufacturer.name,
                  lineId,
                  lineName: line.name
                });
              }
            });
          }
        });
      });
      
      return results;
    } catch (error) {
      console.error('Error searching error codes:', error);
      throw error;
    }
  }
}

export const errorCodesService = new ErrorCodesService();
export default errorCodesService;