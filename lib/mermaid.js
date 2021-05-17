'use strict';

const serializeProp = (prop) => `  ${prop.type} ${prop.name}`;

const serializeEntities = (entityInfos) =>
  entityInfos
    .map(
      ({ name, props }) =>
        `${name} {\n` + props.map(serializeProp).join('\n') + '\n}\n'
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

const serializeERD = (entityInfos) => `erDiagram
${serializeEntities(entityInfos)}
${serializeRelations(entityInfos)}`;

module.exports = serializeERD;
