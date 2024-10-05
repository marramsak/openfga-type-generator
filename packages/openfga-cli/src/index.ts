import { Command } from "commander";
import { generateTypes, parseAuthModel } from "./generators";
import { convertToAuthModel, readFile, saveFile, validateDSL } from "./utils";

const program = new Command();

program
  .name("openfga-type-generator")
  .description("Tool to generate .fga typesafe definitions from dsl")
  .version("1.0.0");

program
  .command("generate")
  .requiredOption("-s, --src <string>", "input path to .fga file", "./src/model.fga")
  .requiredOption("-d, --dist <string>", "output path for generated sdk", "./dist")
  .requiredOption("-n, --name <string>", "output path for generated sdk", "authModel")
  .action(generate);

program.parse();

async function generate({ src, dist, name }: { src: string; dist: string; name: string }) {
  const path = (ext: string) => `${dist}/${name}.${ext}`;
  const dsl = await readFile(src);
  validateDSL(dsl);

  const authModel = convertToAuthModel(dsl);
  const parsedAuthModel = parseAuthModel(authModel.object);
  const tupleCode = generateTypes(parsedAuthModel.object, `${name}Touple`, true);
  const assertionsCode = generateTypes(parsedAuthModel.object, `${name}Assertions`, false);

  saveFile(path("json"), authModel.json);
  saveFile(path("type.meta.json"), parsedAuthModel.json);
  saveFile(path("ts"), `${tupleCode.value} \n ${assertionsCode.value}`);
}
