#!/usr/bin/env node

'use strict';

const fs = require('fs');

const metaschema = require('metaschema');
const { toUpperCamel } = require('metautil');

const yargs = require('yargs');

const plantUML = require('./lib/plantUML.js');
const mermaid = require('./lib/mermaid.js');

const SERIALIZERS = { plantUML, mermaid };

const args = yargs
  .option('path', {
    alias: 'p',
    type: 'string',
    demandOption: true,
    describe: 'Path to the directory that contains schemas',
  })
  .option('type', {
    alias: 't',
    type: 'string',
    default: 'plantUML',
    choices: ['plantUML', 'mermaid'],
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    describe:
      'Path to the output file. ' +
      'If not provided, output will be printed to stdout',
  })
  .help().argv;

run(args).catch((error) => console.error(error));

async function run({ path, type, output }) {
  const model = await metaschema.Model.load(path);
  const entityInfos = [...model.entities].map(([name, schema]) => ({
    name,
    ...getPropsAndRelations(model, schema),
  }));

  const erd = SERIALIZERS[type](entityInfos);
  print(output, erd);
}

function getPropsAndRelations(model, schema, path = '') {
  /* { name, type, required } */
  const props = [];
  /* { name: source, target, unique, required, many } */
  const relations = [];

  for (const [field, definition] of Object.entries(schema.fields)) {
    const name = path ? path + toUpperCamel(field) : field;
    if (definition instanceof metaschema.Schema) {
      const fieldInfo = getPropsAndRelations(model, definition, name);
      props.push(...fieldInfo.props);
      relations.push(...fieldInfo.relations);
    } else if (model.entities.has(definition.type)) {
      props.push({
        name,
        type: definition.many ? 'Id[]' : 'Id',
        required: definition.required,
      });
      /* It's possible that we should check whether target is a detaol*/
      relations.push({
        name,
        source: schema.name,
        target: definition.type,
        unique: definition.unique,
        required: definition.required,
        many: definition.many,
      });
    } else {
      props.push({
        name,
        type: definition.type,
        required: definition.required,
      });
    }
  }

  return { props, relations };
}

function print(path, erd) {
  if (!path) return void console.log(erd);
  return fs.writeFileSync(path, erd);
}
