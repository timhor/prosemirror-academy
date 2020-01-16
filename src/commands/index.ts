import { NodeType } from 'prosemirror-model';
import { Command } from '../types';

// :: (NodeType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Returns a command that tries to set the selected textblocks to the
// given node type with the given attributes.
export function setBlockTypeInSelection(
  nodeType: NodeType,
  attrs: object,
): Command {
  return function(state, dispatch) {
    const { from, to } = state.selection;
    let applicable = false;
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (applicable) {
        return false;
      }

      if (!node.isTextblock || node.hasMarkup(nodeType, attrs)) {
        return;
      }

      if (node.type === nodeType) {
        applicable = true;
      } else {
        const $pos = state.doc.resolve(pos);
        const index = $pos.index();
        applicable = $pos.parent.canReplaceWith(index, index + 1, nodeType);
      }
    });

    if (!applicable) {
      return false;
    }

    if (dispatch) {
      const { tr } = state;
      tr.setBlockType(from, to, nodeType, attrs);
      tr.scrollIntoView();

      dispatch(tr);
    }

    return true;
  };
}
