import { Command } from "commander";
import { generateAuthModelConst, generateAuthModelTypes, parseAuthModel } from "./generators";
import { readConfig, readFile, saveFile, transformDSLToAuthModel, validateDSLString } from "./utils";

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
  validateDSLString(dsl);

  const authModel = transformDSLToAuthModel(dsl);
  const parsedAuthModel = parseAuthModel(authModel);

  const tupleTypesCode = generateAuthModelTypes(parsedAuthModel, `${name}Tuple`, true);
  const assertionTypesCode = generateAuthModelTypes(parsedAuthModel, `${name}Assertion`, false);
  const authModelConstCode = generateAuthModelConst(authModel, `${name}AuthModel`);

  if (config?.generate) {
    const { metadata, tuples, assertions, authmodel } = config.generate;

    if (metadata) {
      saveFile(path("json"), JSON.stringify(authModel, undefined, minify ? 0 : 2), minify);
      saveFile(path("type.meta.json"), JSON.stringify(parsedAuthModel, undefined, minify ? 0 : 2), minify);
    }

    if (tuples || assertions || authmodel) {
      const combinedCode = [tuples && tupleTypesCode, assertions && assertionTypesCode, authmodel && authModelConstCode]
        .filter(Boolean)
        .join("\n");
      saveFile(path("ts"), combinedCode, minify);
    }
  } else {
    saveFile(path("json"), JSON.stringify(authModel, undefined, minify ? 0 : 2), minify);
    saveFile(path("type.meta.json"), JSON.stringify(parsedAuthModel, undefined, minify ? 0 : 2), minify);
    saveFile(path("ts"), `${tupleTypesCode} \n ${assertionTypesCode} \n ${authModelConstCode}`, minify);
  }
}
