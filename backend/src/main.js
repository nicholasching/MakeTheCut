import { Client, Databases, Users, ID } from 'node-appwrite';

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
    // Recalculate averages and update the averages document
    const averages = await calculateAverages(database);
    await database.updateDocument('MacStats','StatData','averages',averages);

    // Recalculate cutoff estimation
    const cutoffs = await calculateCutoffs(database);

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

  // The req object contains the request data
  if (req.path === "/ping") {
    // Use res object to respond with text(), json(), or binary()
    // Don't forget to return a response!
    return res.text("Pong");
  }

  return res.json({
    motto: "Build like a team of hundreds_",
    learn: "https://appwrite.io/docs",
    connect: "https://appwrite.io/discord",
    getInspired: "https://builtwith.appwrite.io",
  });
};

async function calculateAverages(database) {
  const databaseResponse = await database.listDocuments('MacStats','UserData');
  
  let math1za3total = 0;
  let math1zb3total = 0;
  let math1zc3total = 0;
  let phys1d03total = 0;
  let phys1e03total = 0;
  let chem1e03total = 0;
  let eng1p13total = 0;
  
  let math1za3count = 0;
  let math1zb3count = 0;
  let math1zc3count = 0;
  let phys1d03count = 0;
  let phys1e03count = 0;
  let chem1e03count = 0;
  let eng1p13count = 0;

  for (let i = 0; i < databaseResponse.documents.length; i++) {
    const doc = databaseResponse.documents[i];
    
    if (doc.math1za3 > 0) {
      math1za3total += doc.math1za3;
      math1za3count++;
    }
    
    if (doc.math1zb3 > 0) {
      math1zb3total += doc.math1zb3;
      math1zb3count++;
    }
    
    if (doc.math1zc3 > 0) {
      math1zc3total += doc.math1zc3;
      math1zc3count++;
    }
    
    if (doc.phys1d03 > 0) {
      phys1d03total += doc.phys1d03;
      phys1d03count++;
    }
    
    if (doc.phys1e03 > 0) {
      phys1e03total += doc.phys1e03;
      phys1e03count++;
    }
    
    if (doc.chem1e03 > 0) {
      chem1e03total += doc.chem1e03;
      chem1e03count++;
    }
    
    if (doc.eng1p13 > 0) {
      eng1p13total += doc.eng1p13;
      eng1p13count++;
    }
  }
  
  const math1za3average = math1za3count > 0 ? math1za3total / math1za3count : 0;
  const math1zb3average = math1zb3count > 0 ? math1zb3total / math1zb3count : 0;
  const math1zc3average = math1zc3count > 0 ? math1zc3total / math1zc3count : 0;
  const phys1d03average = phys1d03count > 0 ? phys1d03total / phys1d03count : 0;
  const phys1e03average = phys1e03count > 0 ? phys1e03total / phys1e03count : 0;
  const chem1e03average = chem1e03count > 0 ? chem1e03total / chem1e03count : 0;
  const eng1p13average = eng1p13count > 0 ? eng1p13total / eng1p13count : 0;
  
  // Calculate weighted GPA only using courses that have valid counts
  let weightedTotal = 0;
  let weightedCredits = 0;
  
  if (math1za3count > 0) {
    weightedTotal += math1za3average * 3;
    weightedCredits += 3;
  }
  
  if (math1zb3count > 0) {
    weightedTotal += math1zb3average * 3;
    weightedCredits += 3;
  }
  
  if (math1zc3count > 0) {
    weightedTotal += math1zc3average * 3;
    weightedCredits += 3;
  }
  
  if (phys1d03count > 0) {
    weightedTotal += phys1d03average * 3;
    weightedCredits += 3;
  }
  
  if (phys1e03count > 0) {
    weightedTotal += phys1e03average * 3;
    weightedCredits += 3;
  }
  
  if (chem1e03count > 0) {
    weightedTotal += chem1e03average * 3;
    weightedCredits += 3;
  }
  
  if (eng1p13count > 0) {
    weightedTotal += eng1p13average * 13;
    weightedCredits += 13;
  }
  
  const averagegpa = weightedCredits > 0 ? weightedTotal / weightedCredits : 0;
  
  return {
    gpaavg: averagegpa,
    math1za3avg: math1za3average,
    math1zb3avg: math1zb3average,
    math1zc3avg: math1zc3average,
    phys1d03avg: phys1d03average,
    phys1e03avg: phys1e03average,
    chem1e03avg: chem1e03average,
    eng1p13avg: eng1p13average
  };
}

async function calculateCutoffs(database) {
  const databaseResponse = await database.listDocuments('MacStats','UserData');
  // Create a sortedDatabase array with freechoice users first, then sorted by GPA in descending order
  const sortedDatabase = [...databaseResponse.documents].sort((a, b) => {
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