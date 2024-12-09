/// <reference types="vite/client" />

// Add path aliases
declare module '@/*' {
  const content: any;
  export default content;
}