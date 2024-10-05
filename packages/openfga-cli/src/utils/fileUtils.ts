import fs from "node:fs";
import path from "node:path";

export function readFile(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(src, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve(data);
    });
  });
}

export function saveFile(dist: string, data: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    var dirname = path.dirname(dist);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    fs.writeFile(dist, data, (err) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve(true);
    });
  });
}
