import {
  createPrinter,
  createSourceFile,
  EmitHint,
  ScriptKind,
  ScriptTarget,
  TypeAliasDeclaration,
  VariableStatement,
} from "typescript";

/**
 * Converts a TypeScript type alias or variable statement to its textual representation.
 *
 * @param typeDeclaration - The TypeScript type alias or variable statement to convert.
 * @returns The textual representation of the provided type declaration.
 */
export function convertToText(typeDeclaration: TypeAliasDeclaration | VariableStatement) {
  // Create a new source file with the latest script target and TypeScript script kind.
  const sourceFile = createSourceFile("", "", ScriptTarget.Latest, false, ScriptKind.TS);

  // Create a printer to print the AST nodes.
  const printer = createPrinter();

  // Print the provided type declaration node and return its textual representation.
  return printer.printNode(EmitHint.Unspecified, typeDeclaration, sourceFile);
}
