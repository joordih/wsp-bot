declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      MONGODB_URI: string;
    }
  }
}

export {}