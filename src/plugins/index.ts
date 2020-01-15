import {keymap} from 'prosemirror-keymap';
import {baseKeymap} from 'prosemirror-commands';
import {Plugin} from 'prosemirror-state';
import {gapCursor} from 'prosemirror-gapcursor';

export default () => {
  const plugins = [keymap(baseKeymap), gapCursor()];

  return plugins;
};
