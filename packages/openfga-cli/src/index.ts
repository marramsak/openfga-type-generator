import { Command } from "commander";
import { generateTypes, parseAuthModel } from "./generators";
import { convertToAuthModel, readConfig, readFile, saveFile, validateDSL } from "./utils";

const program = new Command();

program
  .name("openfga-type-generator")
  .description("Tool to generate typescript files from openfga dsl (.fga) auth model file.")
  .version("1.0.0");

program
  .command("generate")
  .requiredOption("-s, --src <string>", "input path to .fga file", "./src/model.fga")
  .requiredOption("-d, --dist <string>", "output path for generated sdk", "./dist")
  .requiredOption("-n, --name <string>", "output path for generated sdk", "authModel")
  .requiredOption("-c, --config <string>", "source for the generator config", "./openfga.config.json")
  .option("-m, --minify", "minify the generated code")
  .action(generate);

program.parse();

async function generate(args: { src: string; dist: string; name: string; config: string; minify: boolean }) {
  const config = await readConfig(args.config);
  const dist = config?.dist ?? args.dist;
  const name = config?.name ?? args.name;
  const src = config?.src ?? args.src;
  const minify = config?.minify ?? args.minify;

  const path = (ext: string) => `${dist}/${name}.${ext}`;
  const dsl = await readFile(src);
  validateDSL(dsl);

  const authModel = convertToAuthModel(dsl, `${name}AuthModel`);

  const parsedAuthModel = parseAuthModel(authModel.object);
  const tupleCode = generateTypes(parsedAuthModel.object, `${name}Touple`, true);
  const assertionCode = generateTypes(parsedAuthModel.object, `${name}Assertion`, false);

  if (config?.generate) {
    const { metadata, touples, assertions, authmodel } = config.generate;

    if (metadata) {
      saveFile(path("json"), JSON.stringify(authModel.object, undefined, minify ? 0 : 2), minify);
      saveFile(path("type.meta.json"), JSON.stringify(parsedAuthModel.json, undefined, minify ? 0 : 2), minify);
    }

    if (touples || assertions || authmodel) {
      const combinedCode = [touples && tupleCode.value, assertions && assertionCode.value, authmodel && authModel.value]
        .filter(Boolean)
        .join("\n");
      saveFile(path("ts"), combinedCode, minify);
    }
  } else {
    saveFile(path("json"), JSON.stringify(authModel.object, undefined, minify ? 0 : 2), minify);
    saveFile(path("type.meta.json"), JSON.stringify(parsedAuthModel.json, undefined, minify ? 0 : 2), minify);
    saveFile(path("ts"), `${tupleCode.value} \n ${assertionCode.value} \n ${authModel.value}`, minify);
  }
}
