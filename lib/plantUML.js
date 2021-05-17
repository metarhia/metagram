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

const serializeRelation = (relation) => {
  const sourceConnector = relation.unique ? '|o' : '}o';
  const targetConnector =
    (relation.required ? '|' : 'o') + (relation.many ? '{' : '|');
  return (
    `${relation.source} ${sourceConnector}-` +
    `-${targetConnector} ${relation.target} : ${relation.name}`
  );
};

const serializeRelations = (entityInfos) =>
  entityInfos
    .filter(({ relations }) => relations.length !== 0)
    .map(({ relations }) => relations.map(serializeRelation).join('\n'))
    .join('\n\n');

const serializeERD = (entityInfos) => `@startuml

' hide the spot
hide circle

' avoid problems with angled crows feet
skinparam linetype ortho

${serializeEntities(entityInfos)}
${serializeRelations(entityInfos)}

@enduml`;

module.exports = serializeERD;
