import { InfisicalSDK } from '@infisical/sdk'
import dotenv from 'dotenv'
import fs from 'fs';
import path from 'path';

export default async function validateAndLoadEnv() {
    /**
     * In prod we should directly grab variables
     */
    if (process.env.NODE_ENV != 'dev') {
        const client = new InfisicalSDK({
            //   siteUrl: "your-infisical-instance.com" // Optional, defaults to https://app.infisical.com
        });

        // Authenticate with Infisical
        await client.auth().universalAuth.login({
            clientId: process.env.INFISICAL_MACHINE_IDENTITY,
            clientSecret: process.env.INFISICAL_SECRET,
        });

        const allSecrets = await client.secrets().listSecrets({
            environment: process.env.NODE_ENV, // staging, dev, prod, or custom environment slugs
            projectId: "02379918-e5ad-4477-b182-a2e2fe0ed838" // this will never change
        });

        console.log("PROD: Fetched secrets", allSecrets)
    } else {
        console.log("DEVEL: Skipped secrets, in development env.")
    }
}