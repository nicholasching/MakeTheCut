import { Client, Account, Databases } from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67e081de000573c60d9f'); // Replace with your project ID

export const account = new Account(client);
export const database = new Databases(client);
export { ID } from 'appwrite';
