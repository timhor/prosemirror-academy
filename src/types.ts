import { Transaction, EditorState } from 'prosemirror-state';

export type EditorDispatch = (tr: Transaction) => void;
export type EditorContextType = {
  editorState: EditorState<any> | null;
  editorDispatch: EditorDispatch;
};
