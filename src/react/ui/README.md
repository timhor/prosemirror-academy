This directory is focused on our React components only.

We don't too much interaction from `prosemirror` code. The exception are the commands. We will interact a lot with the EditorState by commands.

For example, if our MenuItem needs to toggle a mark in the current selection, this is how we are doing this:

```js
import { toggleStrongMark } from '../../prosemirror/commands';


const BoldMenuItem = ({
  editorView: { state, dispatch },
  pluginsState,
}: MenuItem<TextFormattingPluginState>) => {
  const onClick = useCallback(() => {
    toggleStrongMark()(state, dispatch);
  }, [state, dispatch]);

  return (
    <button
      onClick={onClick}>
      BOLD
    </button>
  );
};
```
