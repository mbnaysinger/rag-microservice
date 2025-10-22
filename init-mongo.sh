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

const appDb = db.getSiblingDB('pocia');

// Create collections if they don't exist
if (!appDb.getCollectionNames().includes('documents')) {
  appDb.createCollection('documents');
  print('Collection \'documents\' created successfully');
} else {
  print('Collection \'documents\' already exists');
}

if (!appDb.getCollectionNames().includes('document_chunks')) {
  appDb.createCollection('document_chunks');
  print('Collection \'document_chunks\' created successfully');
} else {
  print('Collection \'document_chunks\' already exists');
}
"

echo "MongoDB initialization completed."