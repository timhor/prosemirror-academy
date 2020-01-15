import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { gapCursor } from 'prosemirror-gapcursor';
import { EditorPluginListOptions, KeymapPluginType } from '../types';
import { Schema, NodeType } from 'prosemirror-model';
import { inputRules, textblockTypeInputRule } from 'prosemirror-inputrules';
import { Plugin } from 'prosemirror-state';

const buildKeymap = (schema: Schema): KeymapPluginType => {
  return {
    'Mod-b': toggleMark(schema.marks.strong),
  };
};

function headingRule(nodeType: NodeType, maxLevel: number) {
  return textblockTypeInputRule(
    new RegExp('^(#{1,' + maxLevel + '})\\s$'),
    nodeType,
    match => ({ level: match[1].length }),
  );
}

const buildInputRules = (schema: Schema): Plugin => {
  const {
    nodes: { heading },
  } = schema;

  return inputRules({ rules: [headingRule(heading, 3)] });
};

export const createPluginList = (options: EditorPluginListOptions) => {
  const plugins = [
    buildInputRules(options.schema),
    keymap(buildKeymap(options.schema)),
    keymap(baseKeymap),
    gapCursor(),
  ];

  return plugins;
};
