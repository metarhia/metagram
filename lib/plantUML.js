'use strict';

const serializeProp = (prop) =>
  `  ${prop.required ? '*' : ''}${prop.name}: ${prop.type}`;

const serializeEntities = (entityInfos) =>
  entityInfos
    .map(
      ({ name, props }) =>
        `entity ${name} {\n` + props.map(serializeProp).join('\n') + '\n}\n'
    )
    .join('\n');

const serializeRelation = (relation, config) => {
  const sourceConnector = relation.unique ? '|o' : '}o';
  const targetConnector =
    (relation.required ? '|' : 'o') + (relation.many ? '{' : '|');
  const property =
    `${relation.source} ${sourceConnector}-` +
    `-${targetConnector} ${relation.target}`;
  return config.annotatedRelations
    ? property + ` : ${relation.name}`
    : property;
};

const serializeRelations = (entityInfos, config) =>
  entityInfos
    .filter(({ relations }) => relations.length !== 0)
    .map(({ relations }) =>
      relations
        .map((relation) => serializeRelation(relation, config))
        .join('\n')
    )
    .join('\n\n');

const serializeERD = (entityInfos, config) => `@startuml

' hide the spot
hide circle

' avoid problems with angled crows feet
skinparam linetype ortho

${serializeEntities(entityInfos)}
${serializeRelations(entityInfos, config)}

@enduml`;

module.exports = serializeERD;
