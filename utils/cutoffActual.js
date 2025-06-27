import { Client, Databases, Query } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('makethecut')
    .setKey('KEYHERE');

const databases = new Databases(client);

const DATABASE_ID = 'MacStats';
const STREAM_DATA_COLLECTION = 'StreamData24';
const USER_DATA_COLLECTION = 'UserData24';

/**
 * Calculates actual stream cutoffs based on admission and rejection data
 */
async function calculateActualCutoffs() {
    try {
        console.log('Starting cutoff calculation...');
        
        // Initialize stream data tracking
        const streamData = {
            chem: { admitted: [], rejected: [] },
            civ: { admitted: [], rejected: [] },
            comp: { admitted: [], rejected: [] },
            elec: { admitted: [], rejected: [] },
            engphys: { admitted: [], rejected: [] },
            mat: { admitted: [], rejected: [] },
            mech: { admitted: [], rejected: [] },
            tron: { admitted: [], rejected: [] },
            soft: { admitted: [], rejected: [] }
        };

        // Get all stream admission/rejection documents
        const streamDocuments = await getAllDocuments(databases, DATABASE_ID, STREAM_DATA_COLLECTION);
        console.log(`Found ${streamDocuments.length} stream admission records`);

        // Store the total number of documents in the 'total' document
        try {
            await databases.updateDocument(
                DATABASE_ID,
                'StatData24',
                'total',
                { reportCutoff: streamDocuments.length }
            );
            console.log(`Updated 'total' document with count: ${streamDocuments.length}`);
        } catch (error) {
            console.error(`Failed to update 'total' document count:`, error.message);
        }

        // Debug: collect all unique stream names to see what's actually in the database
        const uniqueStreamNames = new Set();

        // Process each stream document
        for (const streamDoc of streamDocuments) {
            const userId = streamDoc.$id;
            const streamIn = streamDoc.streamIn;
            const streamOut = streamDoc.streamOut;

            // Debug: add stream names to our set
            if (streamIn && streamIn !== 'null') {
                uniqueStreamNames.add(streamIn);
            }
            if (streamOut && streamOut !== 'null') {
                uniqueStreamNames.add(streamOut);
            }

            // Skip if no valid stream data
            if (!streamIn || streamIn === 'null') {
                continue;
            }

            try {
                // Get user's GPA from UserData24
                const userDoc = await databases.getDocument(DATABASE_ID, USER_DATA_COLLECTION, userId);

                // Skip users with free choice
                if (userDoc.freechoice === true) {
                    console.log(`Skipping user ${userId} - user has free choice.`);
                    continue;
                }

                const userGPA = parseFloat(userDoc.gpa);

                // Skip users with 0 or null GPA
                if (!userGPA || userGPA === 0) {
                    console.log(`Skipping user ${userId} - GPA is ${userGPA}`);
                    continue;
                }

                console.log(`Processing user ${userId}: streamIn=${streamIn}, streamOut=${streamOut}, GPA=${userGPA}`);

                // Map stream names to internal keys
                const streamInKey = mapStreamName(streamIn);
                const streamOutKey = streamOut && streamOut !== 'null' ? mapStreamName(streamOut) : null;

                console.log(`Mapped streamIn "${streamIn}" to "${streamInKey}"`);
                if (streamOut && streamOut !== 'null') {
                    console.log(`Mapped streamOut "${streamOut}" to "${streamOutKey}"`);
                }

                // Add GPA to admitted stream
                if (streamInKey && streamData[streamInKey]) {
                    streamData[streamInKey].admitted.push(userGPA);
                    console.log(`✓ Added GPA ${userGPA} to ${streamInKey} admitted list`);
                } else if (streamInKey) {
                    console.log(`✗ StreamInKey "${streamInKey}" not found in streamData`);
                }

                // Add GPA to rejected stream
                if (streamOutKey && streamData[streamOutKey]) {
                    streamData[streamOutKey].rejected.push(userGPA);
                    console.log(`✓ Added GPA ${userGPA} to ${streamOutKey} rejected list`);
                } else if (streamOutKey) {
                    console.log(`✗ StreamOutKey "${streamOutKey}" not found in streamData`);
                }

            } catch (error) {
                console.log(`Could not find GPA for user ${userId}:`, error.message);
            }
        }

        // Debug: print all unique stream names found
        console.log('\n=== DEBUG: Unique stream names found in database ===');
        console.log(Array.from(uniqueStreamNames).sort());
        console.log('====================================================\n');

        // Calculate cutoffs for each stream
        const cutoffs = {};
        
        for (const [streamKey, data] of Object.entries(streamData)) {
            let admitted = [...data.admitted].sort((a, b) => a - b); // Sort ascending (copy array)
            let rejected = [...data.rejected].sort((a, b) => b - a); // Sort descending (copy array)

            console.log(`\n${streamKey}: ${admitted.length} admitted, ${rejected.length} rejected`);
            if (admitted.length > 0) console.log(`  Original Admitted GPAs: ${admitted.join(', ')}`);
            if (rejected.length > 0) console.log(`  Original Rejected GPAs: ${rejected.join(', ')}`);

            // Remove outliers when gap between highest rejected and lowest admitted > 0.5
            if (admitted.length > 0 && rejected.length > 0) {
                let iterations = 0;
                const maxIterations = Math.min(admitted.length, rejected.length) - 1; // Prevent removing all data
                
                while (admitted.length > 1 && rejected.length > 1 && iterations < maxIterations) {
                    const lowestAdmitted = admitted[0];
                    const highestRejected = rejected[0];
                    const gap = Math.abs(lowestAdmitted - highestRejected);
                    
                    if (gap > 0.5) {
                        console.log(`  Removing outliers: lowest admitted ${lowestAdmitted}, highest rejected ${highestRejected} (gap: ${gap.toFixed(2)})`);
                        admitted.shift(); // Remove lowest admitted
                        rejected.shift(); // Remove highest rejected
                        iterations++;
                    } else {
                        break;
                    }
                }
                
                if (iterations > 0) {
                    console.log(`  After removing ${iterations} outlier pairs:`);
                    console.log(`    Filtered Admitted GPAs: ${admitted.join(', ')}`);
                    console.log(`    Filtered Rejected GPAs: ${rejected.join(', ')}`);
                }
            }

            let cutoff = 0;

            if (admitted.length > 0 && rejected.length > 0) {
                // Both admitted and rejected data available
                const lowestAdmitted = admitted[0];
                const highestRejected = rejected[0];
                cutoff = (lowestAdmitted + highestRejected) / 2;
                console.log(`${streamKey}: Final - Lowest admitted: ${lowestAdmitted}, Highest rejected: ${highestRejected}, Cutoff: ${cutoff}`);
            } else if (admitted.length > 0) {
                // Only admitted data available
                cutoff = admitted[0]; // Lowest admitted
                console.log(`${streamKey}: Only admitted data available, using lowest admitted: ${cutoff}`);
            } else if (rejected.length > 0) {
                // Only rejected data available
                cutoff = rejected[0]; // Highest rejected
                console.log(`${streamKey}: Only rejected data available, using highest rejected: ${cutoff}`);
            } else {
                console.log(`${streamKey}: No data available`);
                continue;
            }

            cutoffs[streamKey] = cutoff;

            // Update the StatData24 collection with calculated cutoff
            try {
                await databases.updateDocument(
                    DATABASE_ID,
                    'StatData24',
                    streamKey,
                    { reportCutoff: cutoff }
                );
                console.log(`Updated ${streamKey} cutoff to ${cutoff}`);
            } catch (error) {
                console.error(`Failed to update ${streamKey} cutoff:`, error.message);
            }
        }

        console.log('\nFinal Calculated Cutoffs:');
        console.log(cutoffs);
        
    } catch (error) {
        console.error('Error calculating cutoffs:', error);
        throw error;
    }
}

/**
 * Maps stream display names to internal database keys
 */
function mapStreamName(streamName) {
    if (!streamName || streamName === 'null') return null;
    
    const mapping = {
        'chemical': 'chem',
        'civil': 'civ',
        'computer': 'comp',
        'electrical': 'elec',
        'engineering physics': 'engphys',
        'eng physics': 'engphys',
        'materials': 'mat',
        'mechanical': 'mech',
        'mechatronics': 'tron',
        'software': 'soft',
        // Add more variations that might be in the database
        'chem': 'chem',
        'civ': 'civ',
        'comp': 'comp', 
        'elec': 'elec',
        'engphys': 'engphys',
        'mat': 'mat',
        'mech': 'mech',
        'tron': 'tron',
        'soft': 'soft'
    };

    const normalizedName = streamName.toLowerCase().trim();
    return mapping[normalizedName] || null;
}

/**
 * Helper function to fetch all documents from a collection using pagination
 */
async function getAllDocuments(databases, databaseId, collectionId) {
    const limit = 100;
    let allDocuments = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
        try {
            const response = await databases.listDocuments(
                databaseId,
                collectionId,
                [Query.limit(limit), Query.offset(offset)]
            );

            if (response.documents.length > 0) {
                allDocuments = [...allDocuments, ...response.documents];
                offset += limit;
                hasMore = response.documents.length === limit;
            } else {
                hasMore = false;
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            hasMore = false;
        }
    }

    return allDocuments;
}

// Run the calculation
calculateActualCutoffs()
    .then(() => {
        console.log('\nScript completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });