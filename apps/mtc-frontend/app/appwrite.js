import { Client, Account, Databases } from '@/app/appwrite';

export const client = new Client();

client
    .setEndpoint('https://appwrite.makethecut.ca/v1')
    .setProject('makethecut'); // Replace with your project ID

export const account = new Account(client);
export const database = new Databases(client);
export { ID } from '@/app/appwrite';
