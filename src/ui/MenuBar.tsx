import React, { useCallback } from 'react';
import { toggleMark } from 'prosemirror-commands';
import { setBlockTypeInSelection } from '../commands';
import { EditorView } from 'prosemirror-view';
import { EditorContextType, TextFormattingPluginState } from '../types';

type MenuBarProps = EditorContextType & {
  editorView: EditorView;
};

type MenuItem<T> = {
  editorView: EditorView;
  pluginsState?: T;
};

const BoldMenuItem = ({
  editorView: { state, dispatch },
  pluginsState,
}: MenuItem<TextFormattingPluginState>) => {
  const onClick = useCallback(() => {
    const {
      schema: {
        marks: { strong },
      },
    } = state;
    toggleMark(strong)(state, dispatch);
  }, [state, dispatch]);

  const { strongActive = false, strongDisabled = true } = pluginsState || {};

  return (
    <button
      disabled={strongDisabled}
      className={strongActive ? 'menu-item__active' : ''}
      onClick={onClick}
    >
      BOLD
    </button>
  );
};

const CodeBlockMenuItem = ({
  editorView: { state, dispatch },
  pluginsState,
}: MenuItem<TextFormattingPluginState>) => {
  const onClick = useCallback(() => {
    const {
      schema: {
        nodes: { code_block },
      },
    } = state;

    setBlockTypeInSelection(code_block, {})(state, dispatch);
  }, [state, dispatch]);

  return <button onClick={onClick}>Code Block</button>;
};

const HeadingMenuItem = ({
  editorView: { state, dispatch },
  pluginsState,
  level,
}: MenuItem<TextFormattingPluginState> & { level: number }) => {
  const onClick = useCallback(() => {
    const {
      schema: {
        nodes: { heading },
      },
    } = state;

    setBlockTypeInSelection(heading, { level })(state, dispatch);
  }, [state, dispatch, level]);

  const { headingActive = null } = pluginsState || {};

  return (
    <button
      className={headingActive === level ? 'menu-item__active' : ''}
      onClick={onClick}
    >
      H{level}
    </button>
  );
};

const MenuBar = ({ editorView, editorPluginStates }: MenuBarProps) => {
  const { textFormattingPluginState } = editorPluginStates;

  return (
    <div id="menu-bar">
      <BoldMenuItem
        editorView={editorView}
        pluginsState={textFormattingPluginState}
      />
      <CodeBlockMenuItem
        editorView={editorView}
        pluginsState={textFormattingPluginState}
      />

      <HeadingMenuItem
        editorView={editorView}
        pluginsState={textFormattingPluginState}
        level={1}
      />
      <HeadingMenuItem
        editorView={editorView}
        pluginsState={textFormattingPluginState}
        level={2}
      />
      <HeadingMenuItem
        editorView={editorView}
        pluginsState={textFormattingPluginState}
        level={3}
      />
    </div>
  );
};

export default MenuBar;
