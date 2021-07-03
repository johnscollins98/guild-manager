export const getEnvString = (name: string) => {
  const envVar = process.env[name];
  if (envVar === undefined) {
    throw new Error(`Must provide ${name}`);
  }

  return envVar;
};