import React, { useState, createContext, useRef, useEffect } from 'react';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import ReactDOM from 'react-dom';
import MenuBar from './ui/MenuBar';
import { createPluginList, buildEditorPluginStates } from './plugins';
import { schema } from './schema';
import { EditorPluginStates, EditorContextType } from './types';
import './index.css';

const { Consumer: EditorConsumer, Provider: EditorProvider } = createContext<
  EditorContextType
>({
  editorView: null,
  editorPluginStates: {},
});
const plugins = createPluginList({
  schema,
});

const EditorComponent = ({
  editorRef,
}: {
  editorRef: React.RefObject<HTMLDivElement>;
}) => {
  const [editorPluginStates, setEditorPluginStates] = useState<
    EditorPluginStates
  >({});

  const editorView = React.useRef<EditorView | null>(null);

  useEffect(() => {
    if (editorRef && editorRef.current) {
      const target = editorRef.current;
      editorView.current = new EditorView(target, {
        state: EditorState.create({
          plugins,
          schema,
        }),
        dispatchTransaction(tr) {
          if (editorView.current) {
            const newEditorState = editorView.current.state.apply(tr);

            editorView.current.updateState(newEditorState);

            setEditorPluginStates(
              buildEditorPluginStates(newEditorState, plugins),
            );
          }
        },
      });

      setEditorPluginStates(
        buildEditorPluginStates(editorView.current.state, plugins),
      );

      return () => {
        if (editorView.current) {
          editorView.current.destroy();
        }
      };
    }
  }, [editorRef]);

  return (
    <EditorProvider
      value={{
        editorPluginStates,
        editorView: editorView.current,
      }}
    >
      <EditorConsumer>
        {({ editorView, editorPluginStates }) => {
          if (!editorView) {
            return null;
          }

          return (
            <MenuBar
              editorView={editorView}
              editorPluginStates={editorPluginStates}
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
