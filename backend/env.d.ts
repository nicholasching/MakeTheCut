declare global {
  namespace NodeJS {
    interface ProcessEnv {
      INFISICAL_MACHINE_IDENTITY: string;
      INFISICAL_SECRET: string;
      NODE_ENV: 'dev' | 'prod' | 'test';
    }
  }
}

// This file needs to be a module to work, so add an empty export
export {};