import { Client, Databases, Users, ID } from 'node-appwrite';

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
    const averages = await calculateAverages(database);
    
    await database.updateDocument('MacStats','StatData','averages',averages);

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
