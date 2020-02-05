import React, { useCallback, useRef } from 'react';
import { EditorView } from 'prosemirror-view';
import { EditorContextType, TextFormattingPluginState } from '../../types';
import {
  toggleStrongMark,
  createCodeBlock,
  createHeading,
  toggleTextAlignment,
  performSearchReplace,
  performFind,
  saveReplaceString,
} from '../../prosemirror/commands';

type MenuBarProps = EditorContextType & {
  editorView: EditorView;
};

type MenuItem<T> = {
  editorView: EditorView;
  pluginState?: T;
};

const BoldMenuItem = ({
  editorView: { state, dispatch },
  pluginState,
}: MenuItem<TextFormattingPluginState>) => {
  const onClick = useCallback(() => {
    toggleStrongMark()(state, dispatch);
  }, [state, dispatch]);

  const { strongActive = false, strongDisabled = true } = pluginState || {};

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
  pluginState,
}: MenuItem<TextFormattingPluginState>) => {
  const onClick = useCallback(() => {
    createCodeBlock()(state, dispatch);
  }, [state, dispatch]);

  return <button onClick={onClick}>Code Block</button>;
};

const HeadingMenuItem = ({
  editorView: { state, dispatch },
  pluginState,
  level,
}: MenuItem<TextFormattingPluginState> & { level: number }) => {
  const onClick = useCallback(() => {
    createHeading(level)(state, dispatch);
  }, [state, dispatch, level]);

  const { headingActive = null } = pluginState || {};

  return (
    <button
      className={headingActive === level ? 'menu-item__active' : ''}
      onClick={onClick}
    >
      H{level}
    </button>
  );
};

const TextAlignmentLeftMenuItem = ({
  editorView: { state, dispatch },
  pluginState,
}: MenuItem<TextFormattingPluginState>) => {
  const onClick = useCallback(() => {
    toggleTextAlignment('left')(state, dispatch);
  }, [state, dispatch]);
  return (
    <button
      onClick={onClick}
    >
      LEFT ALIGN
    </button>
  );
};

const TextAlignmentCentreMenuItem = ({
  editorView: { state, dispatch },
  pluginState,
}: MenuItem<TextFormattingPluginState>) => {
  const onClick = useCallback(() => {
    toggleTextAlignment('centre')(state, dispatch);
  }, [state, dispatch]);
  return (
    <button
      onClick={onClick}
    >
      CENTRE ALIGN
    </button>
  );
};

const TextAlignmentRightMenuItem = ({
  editorView: { state, dispatch },
  pluginState,
}: MenuItem<TextFormattingPluginState>) => {
  const onClick = useCallback(() => {
    toggleTextAlignment('right')(state, dispatch);
  }, [state, dispatch]);
  return (
    <button
      onClick={onClick}
    >
      RIGHT ALIGN
    </button>
  );
};

const SearchReplaceMenuItem = ({
  editorView: { state, dispatch },
}: MenuItem<TextFormattingPluginState>) => {
  const searchRef = useRef<HTMLInputElement>(document.createElement('input'));
  const replaceRef = useRef<HTMLInputElement>(document.createElement('input'));

  const onFind = useCallback(() => {
    const searchInput = searchRef.current;

    if (!searchInput) {
      // ensure input field exists
      return;
    }

    performFind({
      searchString: searchInput.value
    })(state, dispatch);
  }, [state, dispatch]);

  const onClick = useCallback(() => {
    const searchInput = searchRef.current;
    const replaceInput = replaceRef.current;

    if (!searchInput || !replaceInput) {
      // ensure both input fields exist
      return;
    }

    performSearchReplace({
      searchString: searchInput.value,
      replaceString: replaceInput.value,
    })(state, dispatch);
  }, [state, dispatch]);

  const onBlur = useCallback(() => {
    const replaceInput = replaceRef.current;
    if (!replaceInput) {
      return;
    }
    saveReplaceString({ stringToReplace: replaceInput.value })(state, dispatch);
  }, [state, dispatch]);

  return (
    <div>
      <input type="text" placeholder="Search" ref={searchRef} />
      <button onClick={onFind}>Find</button>
      <input type="text" placeholder="Replace" onBlur={onBlur} ref={replaceRef} />
      <button onClick={onClick}>Perform Replacement</button>
    </div>
  );
};

const MenuBar = ({ editorView, editorPluginStates }: MenuBarProps) => {
  const { textFormattingPluginState } = editorPluginStates;

  return (
    <div id="menu-bar">
      <BoldMenuItem
        editorView={editorView}
        pluginState={textFormattingPluginState}
      />
      <CodeBlockMenuItem
        editorView={editorView}
        pluginState={textFormattingPluginState}
      />

      <HeadingMenuItem
        editorView={editorView}
        pluginState={textFormattingPluginState}
        level={1}
      />
      <HeadingMenuItem
        editorView={editorView}
        pluginState={textFormattingPluginState}
        level={2}
      />
      <HeadingMenuItem
        editorView={editorView}
        pluginState={textFormattingPluginState}
        level={3}
      />
      <TextAlignmentLeftMenuItem
        editorView={editorView}
        pluginState={textFormattingPluginState}
      />
      <TextAlignmentCentreMenuItem
        editorView={editorView}
        pluginState={textFormattingPluginState}
      />
      <TextAlignmentRightMenuItem
        editorView={editorView}
        pluginState={textFormattingPluginState}
      />
      <SearchReplaceMenuItem
        editorView={editorView}
      />
    </div>
  );
};

export default MenuBar;
