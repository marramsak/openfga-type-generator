import { AuthorizationModel, RelationMetadata, RelationReference, TypeDefinition, Userset } from "@openfga/sdk";

// Define the structure of a type definition entry
interface TypeDefinitionEntry {
  relations: Map<string, Userset>;
  metadata: {
    relations: Map<string, RelationMetadata>;
  };
  type: string;
}

// Define the type for the map of type definitions
export type TypeDefinitionMap = Map<string, TypeDefinitionEntry>;

export type ParsedAuthModel = {
  type: string;
  relations: {
    relationName: string;
    associatedTypes: RelationReference[];
  }[];
}[];

// Transform a single type definition into a TypeDefinitionEntry
function transformTypeDefinition(typeDefinition: TypeDefinition): [string, TypeDefinitionEntry] {
  const typeDef: TypeDefinitionEntry = {
    ...typeDefinition,
    relations: new Map(Object.entries(typeDefinition.relations ?? {})),
    metadata: {
      relations: new Map(Object.entries(typeDefinition.metadata?.relations ?? {})),
    },
    type: typeDefinition.type,
  };
  return [typeDefinition.type, typeDef];
}

// Resolve computed userset
function resolveComputedUserset(
  typeDefinitions: TypeDefinitionMap,
  typeName: string,
  userset: Userset,
): RelationReference[] {
  if (!userset.computedUserset?.relation) return [];
  const computedUserset = typeDefinitions.get(typeName)?.relations.get(userset.computedUserset.relation);
  if (!computedUserset) return [];
  return resolve(typeDefinitions, typeName, userset.computedUserset.relation, computedUserset);
}

// Resolve difference userset
function resolveDifference(
  typeDefinitions: TypeDefinitionMap,
  typeName: string,
  relationName: string,
  userset: Userset,
  root: boolean,
): RelationReference[] {
  if (!userset.difference) return []; // Ensure userset.difference is defined

  const baseRelation = resolve(typeDefinitions, typeName, relationName, userset.difference.base, root);
  const subtractRelation = resolve(typeDefinitions, typeName, relationName, userset.difference.subtract, root);

  return [...baseRelation, ...subtractRelation]; // Flatten values
}

// Resolve intersection userset
function resolveIntersection(
  typeDefinitions: TypeDefinitionMap,
  typeName: string,
  relationName: string,
  userset: Userset,
  root: boolean,
): RelationReference[] {
  return (
    userset.intersection?.child?.flatMap((childUserset) => {
      return resolve(typeDefinitions, typeName, relationName, childUserset, root);
    }) ?? []
  );
}

// Resolve tuple-to-userset
function resolveTupleToUserset(
  typeDefinitions: TypeDefinitionMap,
  typeName: string,
  userset: Userset,
): RelationReference[] {
  if (!userset.tupleToUserset?.tupleset?.relation) return [];
  const tuplesetUserset = typeDefinitions.get(typeName)?.relations.get(userset.tupleToUserset.tupleset.relation);
  if (!tuplesetUserset) return [];
  const tuplesets = resolve(typeDefinitions, typeName, userset.tupleToUserset.tupleset.relation, tuplesetUserset);
  if (!tuplesets) return [];

  return (
    tuplesets.flatMap((tupleset) => {
      if (!tupleset?.type || !userset.tupleToUserset?.computedUserset?.relation) return [];
      const nestedUserset = typeDefinitions
        .get(tupleset.type)
        ?.relations.get(userset.tupleToUserset.computedUserset.relation);
      if (!nestedUserset) return [];
      return resolve(typeDefinitions, tupleset.type, userset.tupleToUserset.computedUserset.relation, nestedUserset);
    }) ?? []
  );
}

// Resolve union userset
function resolveUnion(
  typeDefinitions: TypeDefinitionMap,
  typeName: string,
  relationName: string,
  userset: Userset,
  root: boolean,
): RelationReference[] {
  return (
    userset.union?.child?.flatMap((child) => {
      return resolve(typeDefinitions, typeName, relationName, child, root);
    }) ?? []
  );
}

// Main resolve function to handle different types of usersets
function resolve(
  typeDefinitions: TypeDefinitionMap,
  typeName: string,
  relationName: string,
  userset: Userset,
  root = false,
): RelationReference[] {
  const relationMetadata = typeDefinitions.get(typeName)?.metadata.relations.get(relationName) ?? {};

  if (userset.computedUserset) {
    return resolveComputedUserset(typeDefinitions, typeName, userset);
  } else if (userset.difference) {
    return resolveDifference(typeDefinitions, typeName, relationName, userset, root);
  } else if (userset.intersection) {
    return resolveIntersection(typeDefinitions, typeName, relationName, userset, root);
  } else if (userset.this) {
    return (
      relationMetadata?.directly_related_user_types?.map((relatedUserType) =>
        root ? { ...relatedUserType, drt: true } : relatedUserType,
      ) ?? []
    );
  } else if (userset.tupleToUserset) {
    return resolveTupleToUserset(typeDefinitions, typeName, userset);
  } else if (userset.union) {
    return resolveUnion(typeDefinitions, typeName, relationName, userset, root);
  }

  return [];
}

function mergeArrayByField(references: RelationReference[], field: keyof RelationReference) {
  const result = new Map<string | object, RelationReference>();
  for (const reference of references) {
    const key = reference[field];
    if (!key) continue;

    if (result.has(key)) {
      const merged = { ...result.get(key), ...reference };
      result.set(key, merged);
    } else {
      result.set(key, reference);
    }
  }

  return [...result.values()];
}

// Generate assertions from the authorization model
export function parseAuthModel(authModel?: Omit<AuthorizationModel, "id">) {
  // Transform the type definitions from the authorization model into a Map
  const typeDefinitions = new Map(
    authModel?.type_definitions?.map((typeDefinition) => transformTypeDefinition(typeDefinition)) ?? [],
  );

  // Generate assertions by resolving relations for each type definition
  const assertions: ParsedAuthModel = [...typeDefinitions.values()].map((typeDefinition) => {
    const relations = [...typeDefinition.relations].flatMap(([relationName, relation]) => {
      const associatedTypes = resolve(typeDefinitions, typeDefinition.type, relationName, relation, true);
      const mergedAssociatedTypes = mergeArrayByField(associatedTypes, "type");

      return {
        relationName,
        // Resolve associated types for each relation
        associatedTypes: mergedAssociatedTypes,
      };
    });

    return { type: typeDefinition.type, relations };
  });

  return {
    object: assertions,
    json: JSON.stringify(assertions),
  };
}
