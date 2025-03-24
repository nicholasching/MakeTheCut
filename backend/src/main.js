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
    const average = await calculateAverages(database);
    log(`Average: ${average}`);

    newData = {math1za3avg: average}
    
    await database.createDocument('MacStats','StatData',ID.unique(),newData);

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
    error("Could not list users: " + err.message);
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
  
  let total = 0;
  let count = 0;

  for (let i = 0; i < databaseResponse.documents.length; i++) {
    total += databaseResponse.documents[i].data['math1za3'];
    count++;
  }
  const average = total / count;
  
  return average;
}
