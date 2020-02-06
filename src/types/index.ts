import { Transaction, EditorState } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

export type TextFormattingPluginState = {
  strongDisabled: boolean;
  strongActive: boolean;
  headingActive: number | null;
};
export type TextAlignmentPluginState = {
  alignmentDisabled: boolean;
}
export type PluginState = TextFormattingPluginState & TextAlignmentPluginState;

export type EditorPluginStates = {
  textFormattingPluginState?: TextFormattingPluginState;
  textAlignmentPluginState?: TextAlignmentPluginState;
};

export type EditorPluginListOptions = {
  schema: Schema;
};
export type EditorDispatch = (tr: Transaction) => void;
export type EditorContextType = {
  editorPluginStates: EditorPluginStates;
  editorView: EditorView | null;
};
export type Command = (
  state: EditorState,
  editorDispatch?: EditorDispatch,
) => boolean;

export type KeymapPluginType = {
  [key: string]: Command;
};
