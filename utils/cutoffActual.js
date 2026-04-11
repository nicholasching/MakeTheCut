/**
 * DEPRECATED — Reported-cutoff calculation is now handled automatically by
 * `backend/src/main.js` (runs for every cohort in its streamResultsOpen →
 * streamResultsLock window). Kept for reference / manual debugging only.
 */
import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('makethecut')
    .setKey('KEYHERE');

const databases = new Databases(client);

const DATABASE_ID = 'MacStats';
const USERS_COLLECTION = 'users';
const CUTOFFS_COLLECTION = 'cutoffs';
/**
 * Cohort year for “just finished Eng 1” users when computing reported cutoffs.
 * Increment each May with rollover (matches prior-cohort stream results).
 * Not imported from the frontend schedule.
 */
const ADMIT_GRAD = 24;

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

        const streamDocuments = await getAllDocuments(
            databases,
            DATABASE_ID,
            USERS_COLLECTION,
            [Query.equal('admitYear', ADMIT_GRAD)]
        );
        console.log(`Found ${streamDocuments.length} graduated user rows (admitYear ${ADMIT_GRAD})`);

        // Store the total number of documents in the 'total' document
        try {
            await databases.updateDocument(
                DATABASE_ID,
                CUTOFFS_COLLECTION,
                '24_total',
                { reportCutoff: streamDocuments.length }
            );
            console.log(`Updated '24_total' document with count: ${streamDocuments.length}`);
        } catch (error) {
            console.error(`Failed to update '24_total' document count:`, error.message);
        }

        const uniqueStreamNames = new Set();

        for (const streamDoc of streamDocuments) {
            const userId = streamDoc.$id;
            const streamIn = streamDoc.streamIn;
            const streamOut = streamDoc.streamOut;

            if (streamIn && streamIn !== 'null') {
                uniqueStreamNames.add(streamIn);
            }
            if (streamOut && streamOut !== 'null') {
                uniqueStreamNames.add(streamOut);
            }

            if (!streamIn || streamIn === 'null') {
                continue;
            }

            try {
                if (streamDoc.freechoice === true) {
                    console.log(`Skipping user ${userId} - user has free choice.`);
                    continue;
                }

                const userGPA = parseFloat(streamDoc.gpa);

                if (!userGPA || userGPA === 0) {
                    console.log(`Skipping user ${userId} - GPA is ${userGPA}`);
                    continue;
                }

                console.log(`Processing user ${userId}: streamIn=${streamIn}, streamOut=${streamOut}, GPA=${userGPA}`);

                const streamInKey = mapStreamName(streamIn);
                const streamOutKey = streamOut && streamOut !== 'null' ? mapStreamName(streamOut) : null;

                console.log(`Mapped streamIn "${streamIn}" to "${streamInKey}"`);
                if (streamOut && streamOut !== 'null') {
                    console.log(`Mapped streamOut "${streamOut}" to "${streamOutKey}"`);
                }

                if (streamInKey && streamData[streamInKey]) {
                    streamData[streamInKey].admitted.push(userGPA);
                    console.log(`✓ Added GPA ${userGPA} to ${streamInKey} admitted list`);
                } else if (streamInKey) {
                    console.log(`✗ StreamInKey "${streamInKey}" not found in streamData`);
                }

                if (streamOutKey && streamData[streamOutKey]) {
                    streamData[streamOutKey].rejected.push(userGPA);
                    console.log(`✓ Added GPA ${userGPA} to ${streamOutKey} rejected list`);
                } else if (streamOutKey) {
                    console.log(`✗ StreamOutKey "${streamOutKey}" not found in streamData`);
                }

            } catch (error) {
                console.log(`Could not process user ${userId}:`, error.message);
            }
        }

        console.log('\n=== DEBUG: Unique stream names found in database ===');
        console.log(Array.from(uniqueStreamNames).sort());
        console.log('====================================================\n');

        const cutoffs = {};
        
        for (const [streamKey, data] of Object.entries(streamData)) {
            let admitted = [...data.admitted].sort((a, b) => a - b);
            let rejected = [...data.rejected].sort((a, b) => b - a);

            console.log(`\n${streamKey}: ${admitted.length} admitted, ${rejected.length} rejected`);
            if (admitted.length > 0) console.log(`  Original Admitted GPAs: ${admitted.join(', ')}`);
            if (rejected.length > 0) console.log(`  Original Rejected GPAs: ${rejected.join(', ')}`);

            if (admitted.length > 0 && rejected.length > 0) {
                let iterations = 0;
                const maxIterations = Math.min(admitted.length, rejected.length) - 1;
                
                while (admitted.length > 1 && rejected.length > 1 && iterations < maxIterations) {
                    const lowestAdmitted = admitted[0];
                    const highestRejected = rejected[0];
                    const gap = Math.abs(lowestAdmitted - highestRejected);
                    
                    if (gap > 0.5) {
                        console.log(`  Removing outliers: lowest admitted ${lowestAdmitted}, highest rejected ${highestRejected} (gap: ${gap.toFixed(2)})`);
                        admitted.shift();
                        rejected.shift();
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
                const lowestAdmitted = admitted[0];
                const highestRejected = rejected[0];
                cutoff = (lowestAdmitted + highestRejected) / 2;
                console.log(`${streamKey}: Final - Lowest admitted: ${lowestAdmitted}, Highest rejected: ${highestRejected}, Cutoff: ${cutoff}`);
            } else if (admitted.length > 0) {
                cutoff = admitted[0];
                console.log(`${streamKey}: Only admitted data available, using lowest admitted: ${cutoff}`);
            } else if (rejected.length > 0) {
                cutoff = rejected[0];
                console.log(`${streamKey}: Only rejected data available, using highest rejected: ${cutoff}`);
            } else {
                console.log(`${streamKey}: No data available`);
                continue;
            }

            cutoffs[streamKey] = cutoff;

            try {
                await databases.updateDocument(
                    DATABASE_ID,
                    CUTOFFS_COLLECTION,
                    `24_${streamKey}`,
                    { reportCutoff: cutoff }
                );
                console.log(`Updated 24_${streamKey} cutoff to ${cutoff}`);
            } catch (error) {
                console.error(`Failed to update 24_${streamKey} cutoff:`, error.message);
            }
        }

        console.log('\nFinal Calculated Cutoffs:');
        console.log(cutoffs);
        
    } catch (error) {
        console.error('Error calculating cutoffs:', error);
        throw error;
    }
}

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

async function getAllDocuments(databases, databaseId, collectionId, filterQueries = []) {
    const limit = 100;
    let allDocuments = [];
    let lastId = null;
    let hasMore = true;

    while (hasMore) {
        try {
            const queries = [
                Query.limit(limit),
                Query.orderAsc('$id'),
                ...filterQueries,
            ];
            if (lastId) {
                queries.push(Query.cursorAfter(lastId));
            }
            const response = await databases.listDocuments(
                databaseId,
                collectionId,
                queries
            );

            if (response.documents.length > 0) {
                allDocuments = [...allDocuments, ...response.documents];
                lastId = response.documents[response.documents.length - 1].$id;
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

calculateActualCutoffs()
    .then(() => {
        console.log('\nScript completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
