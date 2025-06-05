import { Client, Databases, Users, Query } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('makethecut')
    .setKey('standard_70a88c567a0a4d842c29e4ec3b325ab1ac96447cc5061ed347245d0eea76521fae32241685aec55ea3d836de053298db44d248b6373ab4b4f76bd87fd7dae1a68dbb9efae3bb5e9f56454391e4633fe60a0c9c58fb85fe088f1edb6e5ec9e71a878c2eaebd3499b7aea1a3dbb50ec12a53ad22952116548a3631ec2b528154f4'); // Replace with your actual API key

const databases = new Databases(client);
const users = new Users(client);

const DATABASE_ID = 'MacStats';
const TARGET_COLLECTION = 'UserData24';

/**
 * Creates an empty document in UserData24 collection for users who:
 * 1. Created their account before June 3rd
 * 2. Don't already have a document in UserData24
 */
try {
    console.log('🚀 Starting empty document creation process...');
    
    // Fetch all users
    console.log('📥 Fetching all users...');
    const allUsers = await getAllUsers();
    console.log(`✅ Found ${allUsers.length} total users`);

    if (allUsers.length === 0) {
        console.log('⚠️  No users found.');
    }

    // Filter users created before June 3rd
    const june3Date = new Date('2025-06-03T00:00:00.000Z');
    const eligibleUsers = allUsers.filter(user => {
        const userCreatedAt = new Date(user.$createdAt);
        return userCreatedAt < june3Date;
    });
    
    console.log(`📅 Found ${eligibleUsers.length} users created before June 3rd, 2025`);

    if (eligibleUsers.length === 0) {
        console.log('⚠️  No users found created before June 3rd.');
    }

    // Check which users don't already have documents in UserData24
    console.log('🔍 Checking which users don\'t have documents in UserData24...');
    const usersNeedingDocs = [];
    
    for (const user of eligibleUsers) {
        try {
            // Try to get the document - if it exists, this won't throw an error
            await databases.getDocument(DATABASE_ID, TARGET_COLLECTION, user.$id);
            console.log(`📄 User ${user.$id} already has a document in UserData24`);
        } catch (error) {
            // Document doesn't exist, user needs one
            usersNeedingDocs.push(user);
            console.log(`✨ User ${user.$id} needs a document in UserData24`);
        }
    }

    console.log(`📝 ${usersNeedingDocs.length} users need empty documents created`);

    if (usersNeedingDocs.length === 0) {
        console.log('✅ All eligible users already have documents in UserData24');
    }

    // Create empty documents for eligible users
    console.log('🏗️  Creating empty documents...');
    let successCount = 0;
    let errorCount = 0;

    const emptyDocumentData = {
        gpa: 0,
        math1za3: 0,
        math1zb3: 0,
        math1zc3: 0,
        phys1d03: 0,
        phys1e03: 0,
        chem1e03: 0,
        eng1p13: 0,
        elec1: "null",
        elec2: "null",
        streams: "null",
        freechoice: false
    };

    for (const user of usersNeedingDocs) {
        try {
            await databases.createDocument(
                DATABASE_ID,
                TARGET_COLLECTION,
                user.$id, // Use UserID as document ID
                emptyDocumentData
            );
            
            successCount++;
            console.log(`✅ Created empty document for user: ${user.$id} (${user.email})`);
        } catch (error) {
            errorCount++;
            console.error(`❌ Failed to create document for user ${user.$id}:`, error.message);
        }
    }

    // Summary
    console.log('\n📊 Creation Summary:');
    console.log(`✅ Successfully created: ${successCount} documents`);
    console.log(`❌ Failed to create: ${errorCount} documents`);
    console.log(`📈 Total eligible users: ${usersNeedingDocs.length}`);
    
    if (successCount === usersNeedingDocs.length) {
        console.log('🎉 All empty documents created successfully!');
    } else if (successCount > 0) {
        console.log('⚠️  Some documents failed to create. Check the errors above.');
    } else {
        console.log('💥 No documents were created successfully.');
    }

} catch (error) {
    console.error('💥 Error during empty document creation process:', error.message);
    process.exit(1);
}

// Helper function to fetch all users using pagination
async function getAllUsers() {
    const limit = 100;
    let allUsers = [];
    let lastId = null;
    let hasMore = true;

    while (hasMore) {
        const queries = [Query.limit(limit)];
        
        if (lastId) {
            queries.push(Query.cursorAfter(lastId));
        }

        const response = await users.list(queries);
        
        if (response.users.length > 0) {
            allUsers = [...allUsers, ...response.users];
            lastId = response.users[response.users.length - 1].$id;
            hasMore = response.users.length === limit;
        } else {
            hasMore = false;
        }
    }

    return allUsers;
}