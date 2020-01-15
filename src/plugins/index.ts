import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { gapCursor } from 'prosemirror-gapcursor';

export const createPluginList = () => {
  const plugins = [keymap(baseKeymap), gapCursor()];

  return plugins;
};
