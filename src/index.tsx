import React, { useState, createContext, useRef, useEffect } from 'react';
import { EditorView } from 'prosemirror-view';
import { EditorState, Plugin } from 'prosemirror-state';
import ReactDOM from 'react-dom';
import { EditorPluginStates, EditorContextType } from './types';
import MenuBar from './react/ui/MenuBar';
import {
  initProseMirrorEditorView,
  buildEditorPluginStates,
} from './prosemirror';
import './index.css';

const { Consumer: EditorConsumer, Provider: EditorProvider } = createContext<
  EditorContextType
>({
  editorView: null,
  editorPluginStates: {},
});

const EditorReactMountComponent = ({
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
      const updateEditorPluginState = (
        newEditorState: EditorState,
        plugins: Array<Plugin>,
      ) => {
        setEditorPluginStates(buildEditorPluginStates(newEditorState, plugins));
      };

      /*
       * For now, we have only two lifecycle events: init and update;
       * We are using those methods to sync the React State with Prosemirror PluginState.
       *
       * You will learn more about that, you don't need to know about it to start writting your plugins.
       * */
      editorView.current = initProseMirrorEditorView(target, {
        onUpdateEditorState: updateEditorPluginState,
        onInitEditorView: updateEditorPluginState,
      });

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

/*
 * The app starts here, but you won't need to touch on this part of the code
 * because of the integration between React and ProseMirror will happen on EditorReactMountComponent.
 */
const App = () => {
  /*
   * The [EditorView](https://prosemirror.net/docs/ref/#view.EditorView.constructor) needs a domNode to mounting
   * EditorView needs a DOM node to append into it.  Usually, we use a `div` but can be any DOM node.
   *
   * The "prosemirror-view" will take care of mounting,
   * update and manager this node and all its children.
   *
   * Please do not add anything inside of it because
   * React will try to control the re-render,
   * then you can end up in an infinite loop os renders.
   *
   * To make our lives easier,
   * we are using some default CSS coming from Prosemirror code.
   * You can check that on `public/index.html` and `index.css`,
   * to make this work, we need to have the `id="editor"` on the div.
   */
  const editorRef = useRef<HTMLDivElement>(document.createElement('div'));

  return (
    <div>
      <EditorReactMountComponent editorRef={editorRef} />
      <div id="editor" ref={editorRef} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
