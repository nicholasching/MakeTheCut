// Used to duplicate collections at the end of the year

import { Client, Databases, Query } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('makethecut')
    .setKey('actual_key_here');

const databases = new Databases(client);

const DATABASE_ID = 'MacStats';
const SOURCE_COLLECTION = 'UserData';
const TARGET_COLLECTION = 'UserData24';

// Helper function to fetch all documents using pagination
async function getAllDocuments(collectionId) {
    const limit = 100;
    let allDocuments = [];
    let lastId = null;
    let hasMore = true;

    while (hasMore) {
        const queries = [Query.limit(limit)];
        
        if (lastId) {
            queries.push(Query.cursorAfter(lastId));
        }

        const response = await databases.listDocuments(DATABASE_ID, collectionId, queries);
        
        if (response.documents.length > 0) {
            allDocuments = [...allDocuments, ...response.documents];
            lastId = response.documents[response.documents.length - 1].$id;
            hasMore = response.documents.length === limit;
        } else {
            hasMore = false;
        }
    }

    return allDocuments;
}

// Main function to copy documents
async function copyMarkDataToMarkData24() {
    try {
        console.log('🚀 Starting copy process...');
        
        // Fetch all documents from MarkData collection
        console.log(`📥 Fetching documents from ${SOURCE_COLLECTION} collection...`);
        const sourceDocuments = await getAllDocuments(SOURCE_COLLECTION);
        console.log(`✅ Found ${sourceDocuments.length} documents in ${SOURCE_COLLECTION}`);

        if (sourceDocuments.length === 0) {
            console.log('⚠️  No documents found to copy.');
            return;
        }

        // Copy each document to MarkData24 collection
        console.log(`📤 Copying documents to ${TARGET_COLLECTION} collection...`);
        let successCount = 0;
        let errorCount = 0;

        for (const doc of sourceDocuments) {
            try {
                // Remove system fields that shouldn't be copied
                const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, ...documentData } = doc;
                
                // Create document in target collection with same ID
                await databases.createDocument(
                    DATABASE_ID,
                    TARGET_COLLECTION,
                    $id, // Use the same document ID
                    documentData
                );
                
                successCount++;
                console.log(`✅ Copied document: ${$id}`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Failed to copy document ${doc.$id}:`, error.message);
            }
        }

        // Summary
        console.log('\n📊 Copy Summary:');
        console.log(`✅ Successfully copied: ${successCount} documents`);
        console.log(`❌ Failed to copy: ${errorCount} documents`);
        console.log(`📈 Total processed: ${sourceDocuments.length} documents`);
        
        if (successCount === sourceDocuments.length) {
            console.log('🎉 All documents copied successfully!');
        } else if (successCount > 0) {
            console.log('⚠️  Some documents failed to copy. Check the errors above.');
        } else {
            console.log('💥 No documents were copied successfully.');
        }

    } catch (error) {
        console.error('💥 Error during copy process:', error.message);
        process.exit(1);
    }
}

// Run the script
copyMarkDataToMarkData24(); 