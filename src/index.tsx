import React, { useRef, useEffect } from 'react';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import ReactDOM from 'react-dom';
import { createPluginList } from './plugins';
import { schema } from './schema';
import './index.css';

const App = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref && ref.current) {
      const target = ref.current;
      new EditorView(target, {
        state: EditorState.create({
          plugins: createPluginList(),
          schema,
        }),
      });
    }
  }, [ref]);

  return <div id="editor" ref={ref} />;
};

ReactDOM.render(<App />, document.getElementById('root'));
