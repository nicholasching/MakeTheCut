import { Client, Databases, Users, Query } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('makethecut')
    .setKey('api_key_here'); // Replace with your actual API key

const databases = new Databases(client);
const users = new Users(client);

const DATABASE_ID = 'MacStats';
const USER_DATA_COLLECTION = 'UserData';

/**
 * Returns the emails of all users which have a document in the UserData collection
 */
async function getFirstYearEmails() {
    try {
        console.log('🚀 Starting to fetch first year user emails...');
        
        // Fetch all documents from UserData collection
        console.log(`📥 Fetching documents from ${USER_DATA_COLLECTION} collection...`);
        const documents = await getAllDocuments(USER_DATA_COLLECTION);
        console.log(`✅ Found ${documents.length} documents in ${USER_DATA_COLLECTION}`);

        if (documents.length === 0) {
            console.log('⚠️  No documents found in UserData collection.');
            return [];
        }

        // Extract user IDs from document IDs (document ID = user ID)
        const userIds = documents.map(doc => doc.$id);
        console.log(`👥 Found ${userIds.length} unique user IDs`);

        // Fetch all users to get their emails
        console.log('📥 Fetching all users...');
        const allUsers = await getAllUsers();
        console.log(`✅ Found ${allUsers.length} total users`);

        // Create a map of user ID to email for quick lookup
        const userEmailMap = new Map();
        allUsers.forEach(user => {
            userEmailMap.set(user.$id, user.email);
        });

        // Get emails for users who have documents in UserData
        const emails = [];
        let foundCount = 0;
        let notFoundCount = 0;

        for (const userId of userIds) {
            const email = userEmailMap.get(userId);
            if (email) {
                emails.push(email);
                foundCount++;
            } else {
                console.warn(`⚠️  User ${userId} has a document but user not found in users list`);
                notFoundCount++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`✅ Found emails: ${foundCount}`);
        if (notFoundCount > 0) {
            console.log(`⚠️  Users not found: ${notFoundCount}`);
        }
        console.log(`📧 Total emails: ${emails.length}`);

        return emails;

    } catch (error) {
        console.error('💥 Error during email fetching process:', error.message);
        throw error;
    }
}

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

// Run the script
getFirstYearEmails()
    .then(emails => {
        console.log('\n📧 First Year User Emails:');
        console.log(emails);
        console.log(`\n✅ Total: ${emails.length} emails`);
    })
    .catch(error => {
        console.error('💥 Error:', error.message);
        process.exit(1);
    });

// Export the function for use as a module
export default getFirstYearEmails;
