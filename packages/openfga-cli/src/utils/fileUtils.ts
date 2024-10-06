import fs from "node:fs";
import path from "node:path";

export function readFile(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(src, "utf8", (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

function minifyCode(source: string) {
  // Remove comments
  let minified = source.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");

  // Remove whitespace
  minified = minified.replace(/\s+/g, " ");

  // Remove spaces around certain characters
  minified = minified.replace(/\s*([{};,:=])\s*/g, "$1");

  return minified.trim(); // Return the minified code
}

// Function to save data to a file, with an option to minify the data before saving
export function saveFile(dist: string, data: string, minify: boolean): Promise<boolean> {
  return new Promise((resolve, reject) => {
    var dirname = path.dirname(dist);
    // Create the directory if it doesn't exist
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    // Minify the data if the minify flag is true
    const minifiedData = minify ? minifyCode(data) : data;

    // Write the (minified) data to the file
    fs.writeFile(dist, minifiedData, (err) => {
      if (err) {
        reject(err); // Reject the promise if there's an error
      }
      resolve(true); // Resolve the promise indicating success
    });
  });
}
