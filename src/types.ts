import { Transaction, EditorState } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';

export type EditorPluginListOptions = {
  schema: Schema;
};
export type EditorDispatch = (tr: Transaction) => void;
export type EditorContextType = {
  editorState: EditorState<any> | null;
  editorDispatch: EditorDispatch;
};
export type Command = (
  state: EditorState,
  editorDispatch?: EditorDispatch,
) => boolean;

export type KeymapPluginType = {
  [key: string]: Command;
};
