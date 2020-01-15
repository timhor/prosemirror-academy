import React, { useCallback } from 'react';
import { EditorContextType } from '../types';
import { toggleMark } from 'prosemirror-commands';
import { EditorState } from 'prosemirror-state';
import { isMarkActive } from '../utils';

type MenuBarProps = EditorContextType & {
  editorState: EditorState<any>;
};

const BoldMenuItem = ({ editorState, editorDispatch }: MenuBarProps) => {
  const onClick = useCallback(() => {
    const {
      schema: {
        marks: { strong },
      },
    } = editorState;
    toggleMark(strong)(editorState, editorDispatch);
  }, [editorState, editorDispatch]);

  const {
    schema: {
      marks: { strong },
    },
  } = editorState;
  const isActive = isMarkActive(editorState, strong);

  return (
    <button className={isActive ? 'menu-item__active' : ''} onClick={onClick}>
      BOLD
    </button>
  );
};

const MenuBar = ({ editorState, editorDispatch }: MenuBarProps) => {
  return (
    <div>
      <BoldMenuItem editorState={editorState} editorDispatch={editorDispatch} />
    </div>
  );
};

export default MenuBar;
