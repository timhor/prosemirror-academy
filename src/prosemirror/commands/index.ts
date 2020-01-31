import { NodeType, Node, MarkType } from 'prosemirror-model';
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

// https://stackoverflow.com/a/58110124
function nonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export const toggleTextAlignment = (alignment: 'left' | 'centre' | 'right'): Command => (state, dispatch) => {
  const doc = state.doc;
  const selection = state.selection;
  const tr = state.tr; // only do this once at the beginning as accessing state.tr creates a new transaction

  const textAlignmentMarkType: MarkType = state.schema.marks.text_align;
  doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    if (node.type.name === 'paragraph') {

      const marks = node.marks
        .map(mark => {
          if (mark.type !== textAlignmentMarkType) {
            return mark;
          }
          return null;
        })
        .filter(nonNullable);

      if (alignment !== 'left') {
        marks.push(textAlignmentMarkType.create({ alignment }));
      }

      tr.setNodeMarkup(
        pos,
        undefined,
        undefined,
        marks,
      );

      return false;
    }
  });

  if (dispatch) {
    dispatch(tr);
  }

  return true;
}

export const performSearchReplace = (searchReplaceOptions: {
  searchString: string;
  replaceString: string;
}): Command => (state, dispatch) => {
  const { tr, doc } = state;
  const { searchString, replaceString } = searchReplaceOptions;
  const textNodeType = state.schema.nodes.text; // this is a node TYPE, not the node itself

  // -2 because nodeSize captures the opening and closing tags as well
  doc.nodesBetween(0, doc.nodeSize - 2, (node, pos) => {
    // apply the change to text nodes only (can also check using Node.isText)
    if (node.type === textNodeType) {
      const nodeText = node.text
      if (!nodeText) {
        return;
      }
      if (nodeText.includes(searchString)) {
        const newString = nodeText.replace(searchString, replaceString);
        // create a new node with replaceString (also create a new marks array to ensure immutability)
        const newNode = state.schema.text(newString, [...node.marks]);
        // adjust positions (e.g. if replaceString is shorter/longer than searchString)
        const fromResolved = tr.mapping.map(pos);
        const toResolved = tr.mapping.map(pos + node.nodeSize);
        // replace the old node with the new one
        tr.replaceWith(fromResolved, toResolved, newNode);
      }
    }
  });

  if (dispatch) {
    dispatch(tr);
  }

  return true;
};
