import { Client, Account, Databases, Functions } from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://appwrite.makethecut.ca/v1')
    .setProject('makethecut'); // Replace with your project ID

export const account = new Account(client);
export const database = new Databases(client);
export const functions = new Functions(client);
export { ID } from 'appwrite';
export { ExecutionMethod } from 'appwrite';
