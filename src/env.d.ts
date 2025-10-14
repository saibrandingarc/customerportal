/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // add more as needed:
    // readonly VITE_APP_TITLE: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  