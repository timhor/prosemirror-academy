import { NodeType, Node } from 'prosemirror-model';
import { toggleMark } from 'prosemirror-commands';
import { Command } from '../../types';

// :: (NodeType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Returns a command that tries to set the selected textblocks to the
// given node type with the given attributes.
const setBlockTypeInSelection = (
  nodeType: NodeType,
  attrs: object,
): Command => (state, dispatch) => {
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

export const toggleStrongMark = (): Command => (state, dispatch) => {
  const {
    schema: {
      marks: { strong },
    },
  } = state;

  return toggleMark(strong)(state, dispatch);
};

export const createCodeBlock = (): Command => (state, dispatch) => {
  const {
    schema: {
      nodes: { code_block },
    },
  } = state;

  return setBlockTypeInSelection(code_block, {})(state, dispatch);
};

export const createHeading = (level: number): Command => (state, dispatch) => {
  const {
    schema: {
      nodes: { heading },
    },
  } = state;

  return setBlockTypeInSelection(heading, { level })(state, dispatch);
};

export const toggleTextAlignment = (alignmentType: 'center'): Command => (state, dispatch) => {
  const doc = state.doc;
  const selection = state.selection;
  type NodeToReplaceType = {
     startPosition: number,
     endPosition: number,
     node: Node,
  };
  const nodesToReplace: Array<NodeToReplaceType> = [];

  doc.nodesBetween(selection.from, selection.to, (node, pos, parent, index) => {
    if (node.type.name === 'paragraph') {
      nodesToReplace.push({
        startPosition: pos,
        endPosition: pos + node.nodeSize,
        node
      })
      return false;
    }
  });

  const applyMarkOnNode = (nodeToReplace: NodeToReplaceType): NodeToReplaceType => {
    const paragraphNodeType: NodeType = state.schema.nodes.paragraph;
    const newNode = paragraphNodeType.create(null, nodeToReplace.node.content);

    return {
      startPosition: nodeToReplace.startPosition,
      endPosition: nodeToReplace.endPosition,
      node: newNode,
    };
  }

  const newNodes = nodesToReplace.map(applyMarkOnNode);
  const tr = state.tr;
  newNodes.forEach((node: NodeToReplaceType) => {
    tr.replaceWith(
      node.startPosition,
      node.endPosition,
      node.node,
    );
  })

  if (dispatch) {
    dispatch(tr);
  }

  return true;
}
