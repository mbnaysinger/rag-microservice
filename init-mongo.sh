#!/bin/bash
set -e

echo "Starting MongoDB initialization..."
sleep 2

# Create user using local connection (no port specification needed)
echo "Creating user..."
mongosh --eval "
const adminDb = db.getSiblingDB('admin');
try {
adminDb.createUser({
   user: 'mongotUser',
   pwd: 'mongotPassword',
   roles: [{ role: 'searchCoordinator', db: 'admin' }]
});
print('User mongotUser created successfully');
} catch (error) {
if (error.code === 11000) {
   print('User mongotUser already exists');
} else {
   print('Error creating user: ' + error);
}
}
"

# Check for existing data
echo "Checking for existing sample data..."
if mongosh --quiet --eval "db.getSiblingDB('sample_airbnb').getCollectionNames().includes('listingsAndReviews')" | grep -q "true"; then
echo "Sample data already exists. Skipping restore."
else
echo "Sample data not found. Running mongorestore..."
if [ -f "/sampledata.archive" ]; then
   mongorestore --archive=/sampledata.archive
   echo "Sample data restored successfully."
else
   echo "Warning: sampledata.archive not found"
fi
fi

# Create application database and collections
echo "Creating application database..."
mongosh --eval "
const appDb = db.getSiblingDB('rag_microservice');
try {
  // Create collections with validation
  appDb.createCollection('documents', {
    validator: {
      \$jsonSchema: {
        bsonType: 'object',
        required: ['fileName', 'fileSize', 'storagePath', 'processingStatus'],
        properties: {
          fileName: { bsonType: 'string' },
          fileSize: { bsonType: 'number' },
          storagePath: { bsonType: 'string' },
          processingStatus: { enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] },
          uploadDate: { bsonType: 'date' },
          processedDate: { bsonType: 'date' }
        }
      }
    }
  });
  
  appDb.createCollection('document_chunks', {
    validator: {
      \$jsonSchema: {
        bsonType: 'object',
        required: ['content', 'chunkNumber', 'documentId'],
        properties: {
          content: { bsonType: 'string' },
          chunkNumber: { bsonType: 'number' },
          documentId: { bsonType: 'objectId' },
          embedding: { bsonType: 'array' },
          createdAt: { bsonType: 'date' }
        }
      }
    }
  });
  
  print('Application database and collections created successfully');
} catch (error) {
  print('Error creating application database: ' + error);
}
"

echo "MongoDB initialization completed."