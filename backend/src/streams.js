import { Client, Databases, Users, ID, Query } from 'node-appwrite';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key']);
  const users = new Users(client);
  const database = new Databases(client);

  try {
    // Fetch all documents from the UserData collection
    const documents = await getAllDocuments(database, 'UserData');

    // Calculate choice counts for each stream
    const choiceCounts = await calculateChoiceCounts(documents);

    // Update each stream document in StatData with choice counts
    await database.updateDocument('MacStats','StatData','chem', {
      firstChoice: choiceCounts.chem.firstChoice,
      secondChoice: choiceCounts.chem.secondChoice,
      thirdChoice: choiceCounts.chem.thirdChoice
    });
    await database.updateDocument('MacStats','StatData','civ', {
      firstChoice: choiceCounts.civ.firstChoice,
      secondChoice: choiceCounts.civ.secondChoice,
      thirdChoice: choiceCounts.civ.thirdChoice
    });
    await database.updateDocument('MacStats','StatData','comp', {
      firstChoice: choiceCounts.comp.firstChoice,
      secondChoice: choiceCounts.comp.secondChoice,
      thirdChoice: choiceCounts.comp.thirdChoice
    });
    await database.updateDocument('MacStats','StatData','elec', {
      firstChoice: choiceCounts.elec.firstChoice,
      secondChoice: choiceCounts.elec.secondChoice,
      thirdChoice: choiceCounts.elec.thirdChoice
    });
    await database.updateDocument('MacStats','StatData','engphys', {
      firstChoice: choiceCounts.engphys.firstChoice,
      secondChoice: choiceCounts.engphys.secondChoice,
      thirdChoice: choiceCounts.engphys.thirdChoice
    });
    await database.updateDocument('MacStats','StatData','mat', {
      firstChoice: choiceCounts.mat.firstChoice,
      secondChoice: choiceCounts.mat.secondChoice,
      thirdChoice: choiceCounts.mat.thirdChoice
    });
    await database.updateDocument('MacStats','StatData','mech', {
      firstChoice: choiceCounts.mech.firstChoice,
      secondChoice: choiceCounts.mech.secondChoice,
      thirdChoice: choiceCounts.mech.thirdChoice
    });
    await database.updateDocument('MacStats','StatData','tron', {
      firstChoice: choiceCounts.tron.firstChoice,
      secondChoice: choiceCounts.tron.secondChoice,
      thirdChoice: choiceCounts.tron.thirdChoice
    });
    await database.updateDocument('MacStats','StatData','soft', {
      firstChoice: choiceCounts.soft.firstChoice,
      secondChoice: choiceCounts.soft.secondChoice,
      thirdChoice: choiceCounts.soft.thirdChoice
    });

  } catch(err) {
    error(err.message);
  }

  return res.text("Choice counts updated successfully");
};

// Helper function to fetch all documents using pagination
async function getAllDocuments(database, collectionId) {
  const limit = 100; // Fetch more documents per request for efficiency
  let allDocuments = [];
  let lastId = null;
  let hasMore = true;

  while (hasMore) {
    const queries = [Query.limit(limit)];
    
    // Add cursor for pagination if we have a lastId
    if (lastId) {
      queries.push(Query.cursorAfter(lastId));
    }

    const response = await database.listDocuments('MacStats', collectionId, queries);
    
    if (response.documents.length > 0) {
      allDocuments = [...allDocuments, ...response.documents];
      lastId = response.documents[response.documents.length - 1].$id;
      
      // Check if we got fewer documents than requested, meaning we reached the end
      hasMore = response.documents.length === limit;
    } else {
      hasMore = false;
    }
  }

  return allDocuments;
}

async function calculateChoiceCounts(documents) {
  // Initialize choice counters for each stream
  const choiceCounts = {
    chem: { firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
    civ: { firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
    comp: { firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
    elec: { firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
    engphys: { firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
    mat: { firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
    mech: { firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
    tron: { firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
    soft: { firstChoice: 0, secondChoice: 0, thirdChoice: 0 }
  };

  // Process each student's stream preferences
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    
    // Skip if no streams data
    if (!doc.streams) continue;
    
    // Parse stream preferences (comma-separated string)
    const streamPreferences = doc.streams.split(',').map(stream => stream.trim().toLowerCase());
    
    // Count choices based on position in preferences
    streamPreferences.forEach((stream, index) => {
      if (choiceCounts[stream]) {
        if (index === 0) {
          choiceCounts[stream].firstChoice++;
        } else if (index === 1) {
          choiceCounts[stream].secondChoice++;
        } else if (index === 2) {
          choiceCounts[stream].thirdChoice++;
        }
      }
    });
  }

  return choiceCounts;
}