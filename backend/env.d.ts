declare global {
  namespace NodeJS {
    interface ProcessEnv {
      INFISICAL_MACHINE_IDENTITY: string;
      INFISICAL_SECRET: string;
      NODE_ENV: 'dev' | 'prod' | 'test';
      MONGO_INITDB_ROOT_USERNAME: string;
      MONGO_INITDB_ROOT_PASSWORD: string;
      PORT?: string;
    }
  }
}

// This file needs to be a module to work, so add an empty export
export { };