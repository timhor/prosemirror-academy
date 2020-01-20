# How to add a new menu item?

Our MenuBar is a React component, but Prosemirror does not know about React and vice-versa, so we needed to build this bridge.

Every time the EditorState of the EditorView is updated, we are building the EditorPluginState.

If you create a new plugin, you probably added the PluginState type on `src/types/index.ts` and updated the `PluginState`. After that, you need to add your new type in two other places:

- PluginState

```
export type PluginState = TextFormattingPluginState | YourNewPluginState
```

- EditorPluginStates

```
export type EditorPluginStates = {
  // [...]
  yourNewPluginName: YourNewPluginState
};
```

Using this code, we will be able to access any plugin state from MenuBar and let React decided when the MenuBar item needs to be updated.

Next, you can go to MenuBar component and uses your new plugin state:

```
const MenuBar = ({ editorView, editorPluginStates }: MenuBarProps) => {
  const { yourNewPluginName } = editorPluginStates;

  return (
    <div id="menu-bar">
      <NiceMenuItem
        editorView={editorView}
        pluginState={yourNewPluginName}
      />
    </div>
  );
};
```
