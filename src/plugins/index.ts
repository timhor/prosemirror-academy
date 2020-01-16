import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { gapCursor } from 'prosemirror-gapcursor';
import { EditorPluginListOptions, KeymapPluginType } from '../types';
import { Schema } from 'prosemirror-model';
import { buildInputRules } from './input-rules';
import { createTextFormattingPlugin } from './text-formatting';
import { Plugin } from 'prosemirror-state';

const buildKeymap = (schema: Schema): KeymapPluginType => {
  return {
    'Mod-b': toggleMark(schema.marks.strong),
  };
};

export const createPluginList = (
  options: EditorPluginListOptions,
): Array<Plugin> => {
  const plugins = [
    buildInputRules(options.schema),
    keymap(buildKeymap(options.schema)),
    keymap(baseKeymap),
    gapCursor(),
    createTextFormattingPlugin(),
  ];

  return plugins;
};

export { buildEditorPluginStates } from './build-plugin-states';
