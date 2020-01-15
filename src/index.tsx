import React, { createContext, useRef, useEffect } from 'react';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import ReactDOM from 'react-dom';
import MenuBar from './ui/MenuBar';
import { createPluginList } from './plugins';
import { schema } from './schema';
import { EditorDispatch, EditorContextType } from './types';
import './index.css';

const emptyEditorDispatch: EditorDispatch = tr => {};
const { Consumer: EditorConsumer, Provider: EditorProvider } = createContext<
  EditorContextType
>({
  editorState: null,
  editorDispatch: emptyEditorDispatch,
});
const plugins = createPluginList({
  schema,
});

const EditorComponent = ({
  editorRef,
}: {
  editorRef: React.RefObject<HTMLDivElement>;
}) => {
  const [editorState, setEditorState] = React.useState<EditorState | null>(
    null,
  );
  const [editorDispatch, setEditorDispatch] = React.useState<EditorDispatch>(
    emptyEditorDispatch,
  );

  useEffect(() => {
    if (editorRef && editorRef.current) {
      const target = editorRef.current;
      const { state, dispatch } = new EditorView(target, {
        state: EditorState.create({
          plugins,
          schema,
        }),
        dispatchTransaction(tr) {
          const editorView = this;

          if (editorView instanceof EditorView) {
            const newEditorState = editorView.state.apply(tr);

            editorView.updateState(newEditorState);
            setEditorState(newEditorState);
          }
        },
      });

      setEditorDispatch(() => dispatch);
      setEditorState(state);
    }
  }, [editorRef]);

  return (
    <EditorProvider value={{ editorState, editorDispatch }}>
      <EditorConsumer>
        {({ editorState, editorDispatch }) => {
          if (!editorState) {
            return null;
          }

          return (
            <MenuBar
              editorState={editorState}
              editorDispatch={editorDispatch}
            />
          );
        }}
      </EditorConsumer>
    </EditorProvider>
  );
};
const App = () => {
  const editorRef = useRef<HTMLDivElement>(document.createElement('div'));

  return (
    <div>
      <EditorComponent editorRef={editorRef} />
      <div id="editor" ref={editorRef} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
