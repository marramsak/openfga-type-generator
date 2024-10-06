import { readFile } from "./fileUtils";

// Interface representing the structure of the configuration object
export interface Config {
  src: string; // Source directory
  dist: string; // Distribution directory
  name: string; // Name prefix for the file and types
  generate: {
    touples: boolean; // Flag to generate tuples
    assertions: boolean; // Flag to generate assertions
    metadata: boolean; // Flag to generate metadata
    authmodel: boolean; // Flag to generate authentication model
  };
  minify: boolean; // Flag to minify the output
}

// Function to read and parse the configuration file
export async function readConfig(src: string): Promise<Config | undefined> {
  try {
    // Read the configuration file from the given source path
    const configFile = await readFile(src);
    // Parse the JSON content of the configuration file
    const config: Config = JSON.parse(configFile);
    return config;
  } catch (e) {
    // Return undefined if there is an error (e.g., file not found or JSON parsing error)
    return undefined;
  }
}
