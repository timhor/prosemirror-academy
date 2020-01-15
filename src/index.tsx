import React, {useRef, useEffect} from 'react';
import {EditorView} from 'prosemirror-view';
import {EditorState} from 'prosemirror-state';
import ReactDOM from 'react-dom';
import './index.css';

const App = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref && ref.current) {
      const target = ref.current;
      console.log(ref.current);

      const view = new EditorView(target, {
        state: EditorState.create({}),
      });

      console.log('Prosemirror', view);
    }

    // new EditorView(document.querySelector('#editor'), {
    //   state: EditorState.create({
    //     doc: DOMParser.fromSchema(mySchema).parse(
    //       document.querySelector('#content'),
    //     ),
    //     plugins: exampleSetup({schema: mySchema}),
    //   }),
    // });
  }, [ref]);

  return <div id="editor" ref={ref} />;
};

ReactDOM.render(<App />, document.getElementById('root'));
