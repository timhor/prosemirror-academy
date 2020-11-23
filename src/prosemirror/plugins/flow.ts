import {
  EditorState,
  Plugin,
  PluginKey,
  StateField,
  Transaction,
} from 'prosemirror-state';
import { FlowPluginState } from '../../types';

export const pluginKey = new PluginKey('flow');

export const createFlowPlugin = (): Plugin<StateField<FlowPluginState>> => {
  return new Plugin({
    key: pluginKey,
    state: {
      init(_config, _state: EditorState): FlowPluginState {
        return {};
      },

      apply(
        tr: Transaction,
        oldPluginState: FlowPluginState,
        _oldState: EditorState,
        _newState: EditorState,
      ): FlowPluginState {
        return oldPluginState;
      },
    },
  });
};