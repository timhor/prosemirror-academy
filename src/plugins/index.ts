import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { gapCursor } from 'prosemirror-gapcursor';
import { EditorPluginListOptions, KeymapPluginType } from '../types';
import { Schema } from 'prosemirror-model';
import { buildInputRules } from './input-rules';

const buildKeymap = (schema: Schema): KeymapPluginType => {
  return {
    'Mod-b': toggleMark(schema.marks.strong),
  };
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
