import { Client, Databases, Users, ID, Query } from 'node-appwrite';

const totalChemSeats = 261/4
const totalCivSeats = 374/4
const totalCompSeats = 372/4
const totalElecSeats = 550/4
const totalEngPhysSeats = 217/4
const totalMatSeats = 138/4
const totalMechSeats = 583/4
const totalTronSeats = 291/4
const totalSoftSeats = 438/4

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const users = new Users(client);
  const database = new Databases(client);

  try {
    // Fetch all documents from the UserData collection
    const documents = await getAllDocuments(database, 'UserData');

    // Recalculate averages and update the averages document
    const distribution = await calculateDistribution(documents);
    await database.updateDocument('MacStats','MarkData','math1za3',distribution.math1za3);
    await database.updateDocument('MacStats','MarkData','math1zb3',distribution.math1zb3);
    await database.updateDocument('MacStats','MarkData','math1zc3',distribution.math1zc3);
    await database.updateDocument('MacStats','MarkData','phys1d03',distribution.phys1d03);
    await database.updateDocument('MacStats','MarkData','phys1e03',distribution.phys1e03);
    await database.updateDocument('MacStats','MarkData','chem1e03',distribution.chem1e03);
    await database.updateDocument('MacStats','MarkData','eng1p13',distribution.eng1p13);
    await database.updateDocument('MacStats','MarkData','total',distribution.total);

    // Recalculate cutoff estimation
    const cutoffs = await calculateCutoffs(documents);

    const chemStats = {streamCount: cutoffs.chemCount, streamCutoff: cutoffs.chemCut};
    const civStats = {streamCount: cutoffs.civCount, streamCutoff: cutoffs.civCut};
    const compStats = {streamCount: cutoffs.compCount, streamCutoff: cutoffs.compCut};
    const elecStats = {streamCount: cutoffs.elecCount, streamCutoff: cutoffs.elecCut};
    const engphysStats = {streamCount: cutoffs.engphysCount, streamCutoff: cutoffs.engphysCut};
    const matStats = {streamCount: cutoffs.matCount, streamCutoff: cutoffs.matCut};
    const mechStats = {streamCount: cutoffs.mechCount, streamCutoff: cutoffs.mechCut};
    const tronStats = {streamCount: cutoffs.tronCount, streamCutoff: cutoffs.tronCut};
    const softStats = {streamCount: cutoffs.softCount, streamCutoff: cutoffs.softCut};

    await database.updateDocument('MacStats','StatData','chem',chemStats);
    await database.updateDocument('MacStats','StatData','civ',civStats);
    await database.updateDocument('MacStats','StatData','comp',compStats);
    await database.updateDocument('MacStats','StatData','elec',elecStats);
    await database.updateDocument('MacStats','StatData','engphys',engphysStats);
    await database.updateDocument('MacStats','StatData','mat',matStats);
    await database.updateDocument('MacStats','StatData','mech',mechStats);
    await database.updateDocument('MacStats','StatData','tron',tronStats);
    await database.updateDocument('MacStats','StatData','soft',softStats);
    await database.updateDocument('MacStats','StatData','total',{streamCount: documents.length});

    /*
    // Logging
    const usersResponse = await users.list();
    const databaseResponse = await database.listDocuments('MacStats','UserData');
    // Log messages and errors to the Appwrite Console
    // These logs won't be seen by your end users
    log(`Total users: ${usersResponse.total}`);
    log(`Users: ${usersResponse.users.map(user => user.name).join(', ')}`);
    for (let i = 0; i < databaseResponse.documents.length; i++) {
      log(`Document ${i}: ${JSON.stringify(databaseResponse.documents[i])}`);
    }

    log(`User JSON: ${JSON.stringify(usersResponse)}`);
    log(`Documents JSON: ${JSON.stringify(databaseResponse)}`);
    */


  } catch(err) {
    error(err.message);
  }

  /* Sample Routering Connection

  // The req object contains the request data
  if (req.path === "/ping") {
    // Use res object to respond with text(), json(), or binary()
    // Don't forget to return a response!
    return res.text("Pong");
  }

  */
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

async function calculateDistribution(documents) {

  let math1za3 = Array(12).fill(0);
  let math1zb3 = Array(12).fill(0);
  let math1zc3 = Array(12).fill(0);
  let phys1d03 = Array(12).fill(0);
  let phys1e03 = Array(12).fill(0);
  let chem1e03 = Array(12).fill(0);
  let eng1p13 = Array(12).fill(0);
  let gpa = Array(12).fill(0);

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    
    if (doc.math1za3 > 0) {
      math1za3[doc.math1za3 - 1]++;
    }

    // Syntax [condition] && [action] is a shorthand for if (condition) { action; }
    doc.math1za3 > 0 && math1za3[doc.math1za3 - 1]++;
    doc.math1zb3 > 0 && math1zb3[doc.math1zb3 - 1]++;
    doc.math1zc3 > 0 && math1zc3[doc.math1zc3 - 1]++;
    doc.phys1d03 > 0 && phys1d03[doc.phys1d03 - 1]++;
    doc.phys1e03 > 0 && phys1e03[doc.phys1e03 - 1]++;
    doc.chem1e03 > 0 && chem1e03[doc.chem1e03 - 1]++;
    doc.eng1p13 > 0 && eng1p13[doc.eng1p13 - 1]++;
    doc.gpa > 0 && gpa[Math.round(doc.gpa - 1)]++;
  }
  
  const math1za3avg= (math1za3[0] + math1za3[1] + math1za3[2] + math1za3[3] + math1za3[4] + math1za3[5] + math1za3[6] + math1za3[7] + math1za3[8] + math1za3[9] + math1za3[10] + math1za3[11] > 0) ? (math1za3[0] * 1 + math1za3[1] * 2 + math1za3[2] * 3 + math1za3[3] * 4 + math1za3[4] * 5 + math1za3[5] * 6 + math1za3[6] * 7 + math1za3[7] * 8 + math1za3[8] * 9 + math1za3[9] * 10 + math1za3[10] * 11 + math1za3[11] * 12) / (math1za3[0] + math1za3[1] + math1za3[2] + math1za3[3] + math1za3[4] + math1za3[5] + math1za3[6] + math1za3[7] + math1za3[8] + math1za3[9] + math1za3[10] + math1za3[11]) : 0; 
  const math1zb3avg= (math1zb3[0] + math1zb3[1] + math1zb3[2] + math1zb3[3] + math1zb3[4] + math1zb3[5] + math1zb3[6] + math1zb3[7] + math1zb3[8] + math1zb3[9] + math1zb3[10] + math1zb3[11] > 0) ? (math1zb3[0] * 1 + math1zb3[1] * 2 + math1zb3[2] * 3 + math1zb3[3] * 4 + math1zb3[4] * 5 + math1zb3[5] * 6 + math1zb3[6] * 7 + math1zb3[7] * 8 + math1zb3[8] * 9 + math1zb3[9] * 10 + math1zb3[10] * 11 + math1zb3[11] * 12) / (math1zb3[0] + math1zb3[1] + math1zb3[2] + math1zb3[3] + math1zb3[4] + math1zb3[5] + math1zb3[6] + math1zb3[7] + math1zb3[8] + math1zb3[9] + math1zb3[10] + math1zb3[11]) : 0;
  const math1zc3avg= (math1zc3[0] + math1zc3[1] + math1zc3[2] + math1zc3[3] + math1zc3[4] + math1zc3[5] + math1zc3[6] + math1zc3[7] + math1zc3[8] + math1zc3[9] + math1zc3[10] + math1zc3[11] > 0) ? (math1zc3[0] * 1 + math1zc3[1] * 2 + math1zc3[2] * 3 + math1zc3[3] * 4 + math1zc3[4] * 5 + math1zc3[5] * 6 + math1zc3[6] * 7 + math1zc3[7] * 8 + math1zc3[8] * 9 + math1zc3[9] * 10 + math1zc3[10] * 11 + math1zc3[11] * 12) / (math1zc3[0] + math1zc3[1] + math1zc3[2] + math1zc3[3] + math1zc3[4] + math1zc3[5] + math1zc3[6] + math1zc3[7] + math1zc3[8] + math1zc3[9] + math1zc3[10] + math1zc3[11]) : 0;
  const phys1d03avg= (phys1d03[0] + phys1d03[1] + phys1d03[2] + phys1d03[3] + phys1d03[4] + phys1d03[5] + phys1d03[6] + phys1d03[7] + phys1d03[8] + phys1d03[9] + phys1d03[10] + phys1d03[11] > 0) ? (phys1d03[0] * 1 + phys1d03[1] * 2 + phys1d03[2] * 3 + phys1d03[3] * 4 + phys1d03[4] * 5 + phys1d03[5] * 6 + phys1d03[6] * 7 + phys1d03[7] * 8 + phys1d03[8] * 9 + phys1d03[9] * 10 + phys1d03[10] * 11 + phys1d03[11] * 12) / (phys1d03[0] + phys1d03[1] + phys1d03[2] + phys1d03[3] + phys1d03[4] + phys1d03[5] + phys1d03[6] + phys1d03[7] + phys1d03[8] + phys1d03[9] + phys1d03[10] + phys1d03[11]) : 0;
  const phys1e03avg= (phys1e03[0] + phys1e03[1] + phys1e03[2] + phys1e03[3] + phys1e03[4] + phys1e03[5] + phys1e03[6] + phys1e03[7] + phys1e03[8] + phys1e03[9] + phys1e03[10] + phys1e03[11] > 0) ? (phys1e03[0] * 1 + phys1e03[1] * 2 + phys1e03[2] * 3 + phys1e03[3] * 4 + phys1e03[4] * 5 + phys1e03[5] * 6 + phys1e03[6] * 7 + phys1e03[7] * 8 + phys1e03[8] * 9 + phys1e03[9] * 10 + phys1e03[10] * 11 + phys1e03[11] * 12) / (phys1e03[0] + phys1e03[1] + phys1e03[2] + phys1e03[3] + phys1e03[4] + phys1e03[5] + phys1e03[6] + phys1e03[7] + phys1e03[8] + phys1e03[9] + phys1e03[10] + phys1e03[11]) : 0;
  const chem1e03avg= (chem1e03[0] + chem1e03[1] + chem1e03[2] + chem1e03[3] + chem1e03[4] + chem1e03[5] + chem1e03[6] + chem1e03[7] + chem1e03[8] + chem1e03[9] + chem1e03[10] + chem1e03[11] > 0) ? (chem1e03[0] * 1 + chem1e03[1] * 2 + chem1e03[2] * 3 + chem1e03[3] * 4 + chem1e03[4] * 5 + chem1e03[5] * 6 + chem1e03[6] * 7 + chem1e03[7] * 8 + chem1e03[8] * 9 + chem1e03[9] * 10 + chem1e03[10] * 11 + chem1e03[11] * 12) / (chem1e03[0] + chem1e03[1] + chem1e03[2] + chem1e03[3] + chem1e03[4] + chem1e03[5] + chem1e03[6] + chem1e03[7] + chem1e03[8] + chem1e03[9] + chem1e03[10] + chem1e03[11]) : 0;
  const eng1p13avg= (eng1p13[0] + eng1p13[1] + eng1p13[2] + eng1p13[3] + eng1p13[4] + eng1p13[5] + eng1p13[6] + eng1p13[7] + eng1p13[8] + eng1p13[9] + eng1p13[10] + eng1p13[11] > 0) ? (eng1p13[0] * 1 + eng1p13[1] * 2 + eng1p13[2] * 3 + eng1p13[3] * 4 + eng1p13[4] * 5 + eng1p13[5] * 6 + eng1p13[6] * 7 + eng1p13[7] * 8 + eng1p13[8] * 9 + eng1p13[9] * 10 + eng1p13[10] * 11 + eng1p13[11] * 12) / (eng1p13[0] + eng1p13[1] + eng1p13[2] + eng1p13[3] + eng1p13[4] + eng1p13[5] + eng1p13[6] + eng1p13[7] + eng1p13[8] + eng1p13[9] + eng1p13[10] + eng1p13[11]) : 0;
  const gpaavg = (gpa[0] + gpa[1] + gpa[2] + gpa[3] + gpa[4] + gpa[5] + gpa[6] + gpa[7] + gpa[8] + gpa[9] + gpa[10] + gpa[11] > 0) ? (gpa[0] * 1 + gpa[1] * 2 + gpa[2] * 3 + gpa[3] * 4 + gpa[4] * 5 + gpa[5] * 6 + gpa[6] * 7 + gpa[7] * 8 + gpa[8] * 9 + gpa[9] * 10 + gpa[10] * 11 + gpa[11] * 12) / (gpa[0] + gpa[1] + gpa[2] + gpa[3] + gpa[4] + gpa[5] + gpa[6] + gpa[7] + gpa[8] + gpa[9] + gpa[10] + gpa[11]) : 0;
  
  return {
    math1za3: {
      distribution: math1za3.join(','),
      average: math1za3avg
    },
    math1zb3: {
      distribution: math1zb3.join(','),
      average: math1zb3avg
    },
    math1zc3: {
      distribution: math1zc3.join(','),
      average: math1zc3avg
    },
    phys1d03: {
      distribution: phys1d03.join(','),
      average: phys1d03avg
    },
    phys1e03: {
      distribution: phys1e03.join(','),
      average: phys1e03avg
    },
    chem1e03: {
      distribution: chem1e03.join(','),
      average: chem1e03avg
    },
    eng1p13: {
      distribution: eng1p13.join(','),
      average: eng1p13avg
    },
    total: {
      distribution: gpa.join(','),
      average: gpaavg
    }
  };
}

async function calculateCutoffs(documents) {
  // Create a sortedDatabase array with freechoice users first, then sorted by GPA in descending order
  const sortedDatabase = [...documents].sort((a, b) => {
    // First sort by freechoice (true values come first)
    if (a.freechoice && !b.freechoice) return -1;
    if (!a.freechoice && b.freechoice) return 1;
    
    // If freechoice status is the same, sort by GPA in descending order
    return b.gpa - a.gpa;
  });

  const totalSeats = totalChemSeats + totalCivSeats + totalCompSeats + totalElecSeats + totalEngPhysSeats + totalMatSeats + totalMechSeats + totalTronSeats + totalSoftSeats;
  const allocations = {chem: totalChemSeats/totalSeats, civ: totalCivSeats/totalSeats, comp: totalCompSeats/totalSeats, elec: totalElecSeats/totalSeats, engphys: totalEngPhysSeats/totalSeats, mat: totalMatSeats/totalSeats, mech: totalMechSeats/totalSeats, tron: totalTronSeats/totalSeats, soft: totalSoftSeats/totalSeats};
  const actualSeats = {chem: Math.ceil(allocations.chem * sortedDatabase.length), civ: Math.ceil(allocations.civ * sortedDatabase.length), comp: Math.ceil(allocations.comp * sortedDatabase.length), elec: Math.ceil(allocations.elec * sortedDatabase.length), engphys: Math.ceil(allocations.engphys * sortedDatabase.length), mat: Math.ceil(allocations.mat * sortedDatabase.length), mech: Math.ceil(allocations.mech * sortedDatabase.length), tron: Math.ceil(allocations.tron * sortedDatabase.length), soft: Math.ceil(allocations.soft * sortedDatabase.length)};
  
  // Initialize stream counts and assigned students
  const streamCounts = {
    chem: 0,
    civ: 0,
    comp: 0,
    elec: 0,
    engphys: 0,
    mat: 0,
    mech: 0,
    tron: 0,
    soft: 0
  };
  
  // Track cutoff GPAs (initialized as 0)
  const cutoffGPAs = {
    chem: 0,
    civ: 0,
    comp: 0,
    elec: 0,
    engphys: 0,
    mat: 0,
    mech: 0,
    tron: 0,
    soft: 0
  };
  
  // Track the lowest non-freechoice GPA assigned to each stream
  const lowestGPAs = {
    chem: -1,
    civ: -1,
    comp: -1,
    elec: -1,
    engphys: -1,
    mat: -1,
    mech: -1,
    tron: -1,
    soft: -1
  };
  
  // Keep track of assigned students to avoid double-counting
  const assignedStudents = new Set();
  
  // First pass: Handle free choice students
  const freeChoiceStudents = [];
  const regularStudents = [];
  
  sortedDatabase.forEach(student => {
    if (student.freechoice) {
      freeChoiceStudents.push(student);
    } else {
      regularStudents.push(student);
    }
  });
  
  // Assign free choice students first
  freeChoiceStudents.forEach(student => {
    if (!student.streams) return; // Skip if no stream preferences
    
    const streamPreferences = student.streams.split(',').map(stream => stream.trim().toLowerCase());
    if (streamPreferences.length > 0) {
      // Take first choice for free choice students
      const firstChoice = streamPreferences[0];
      if (firstChoice in streamCounts) {
        streamCounts[firstChoice]++;
        assignedStudents.add(student.$id);
      }
    }
  });
  
  // Second pass: Regular students by GPA
  regularStudents.forEach(student => {
    if (assignedStudents.has(student.$id) || !student.streams) return;
    
    const streamPreferences = student.streams.split(',').map(stream => stream.trim().toLowerCase());
    
    // Try to assign based on preferences
    for (const stream of streamPreferences) {
      if (stream in streamCounts && streamCounts[stream] < actualSeats[stream]) {
        streamCounts[stream]++;
        assignedStudents.add(student.$id);
        
        // Update the lowest GPA for this stream
        if (lowestGPAs[stream] === -1 || student.gpa < lowestGPAs[stream]) {
          lowestGPAs[stream] = student.gpa;
        }
        break; // Student has been assigned, stop trying other preferences
      }
    }
  });
  
  // Calculate cutoffs
  Object.keys(streamCounts).forEach(stream => {
    // If stream is filled or partially filled by non-freechoice students
    if (lowestGPAs[stream] !== -1) {
      cutoffGPAs[stream] = lowestGPAs[stream];
    } 
    // If stream filled entirely by freechoice students
    else if (streamCounts[stream] >= actualSeats[stream]) {
      cutoffGPAs[stream] = 12; // Maximum GPA if all seats are filled by free choice
    }
    // Stream not filled at all
    else {
      cutoffGPAs[stream] = 4;
    }
  });
  
  // Final check: ensure any stream with fewer filled seats than available seats has cutoff of 4
  Object.keys(streamCounts).forEach(stream => {
    if (streamCounts[stream] < actualSeats[stream]) {
      cutoffGPAs[stream] = 4;
    }
  });

  return {
    chemCut: cutoffGPAs.chem,
    chemCount: streamCounts.chem,
    civCut: cutoffGPAs.civ,
    civCount: streamCounts.civ,
    compCut: cutoffGPAs.comp, 
    compCount: streamCounts.comp,
    elecCut: cutoffGPAs.elec,
    elecCount: streamCounts.elec,
    engphysCut: cutoffGPAs.engphys,
    engphysCount: streamCounts.engphys,
    matCut: cutoffGPAs.mat,
    matCount: streamCounts.mat,
    mechCut: cutoffGPAs.mech,
    mechCount: streamCounts.mech,
    tronCut: cutoffGPAs.tron,
    tronCount: streamCounts.tron,
    softCut: cutoffGPAs.soft,
    softCount: streamCounts.soft
  };
}