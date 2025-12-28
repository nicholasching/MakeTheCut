type EnvConfig = {
  NODE_ENV: 'dev' | 'prod' | 'test';
};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Required<EnvConfig> {
      [key: string]: string;
    }
  }
}

// This file needs to be a module to work, so add an empty export
export { };