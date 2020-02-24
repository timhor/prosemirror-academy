import { Node, NodeType, MarkType } from 'prosemirror-model';
import { DecorationSet } from 'prosemirror-view';
import { Transaction } from 'prosemirror-state';
import { toggleMark } from 'prosemirror-commands';
import { Command } from '../../types';
import { pluginKey as textHighlightingPluginKey } from '../plugins/text-highlighting';

const DEFAULT_TOKEN_SIZE = 2;

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
    if (node.type.name === 'paragraph' || node.type.name === 'heading') {
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

  // if there is no change in the transaction, it is the same as checking for a code block
  // because the document could not have been modified unless the selection is in a paragraph
  // or heading (that validation is already done in the nodesBetween callback above)
  // [note: it is an anti-pattern to return false after dispatch]
  if (!tr.docChanged) {
    return false;
  }

  if (dispatch) {
    dispatch(tr);
  }

  return true;
}

export const performFind = (searchOptions: {
  searchString: string;
}): Command => (state, dispatch) => {
  const { tr } = state;

  // set metadata in transaction so that the plugin can access the searchString
  tr.setMeta(textHighlightingPluginKey, {
    stringToHighlight: searchOptions.searchString,
  });

  if (dispatch) {
    dispatch(tr);
  }

  return true;
}

export const saveReplaceString = (searchOptions: {
  stringToReplace: string;
}): Command => (state, dispatch) => {
  const { tr } = state;

  tr.setMeta(textHighlightingPluginKey, {
    stringToReplace: searchOptions.stringToReplace,
  });

  if (dispatch) {
    dispatch(tr);
  }

  return true;
};

const replaceNode = (replaceOptions: {
  tr: Transaction,
  node: Node,
  searchString: string,
  replaceString: string,
  pos: number,
}) => {
  const { tr, node, searchString, replaceString, pos } = replaceOptions;

  // apply the change to text nodes only
  if (!node.isText || !node.text || !node.text.includes(searchString)) {
    return false;
  }

  // adjust positions (e.g. if replaceString is shorter/longer than searchString)
  const fromResolved = tr.mapping.map(pos);
  const toResolved = tr.mapping.map(pos + node.nodeSize);
  const newString = node.text.replace(RegExp(searchString, 'g'), replaceString);

  // create a new node with replaceString (also create a new marks array to ensure immutability)
  const newNode = node.type.schema.text(newString, [...node.marks]);

  // replace the old node with the new one
  tr.replaceWith(fromResolved, toResolved, newNode);

  return true;
};

export const performSearchReplace = (searchReplaceOptions: {
  searchString: string;
  replaceString: string;
}): Command => (state, dispatch) => {
  const { tr, doc } = state;
  const { searchString, replaceString } = searchReplaceOptions;

  // this is true for an empty doc because of the opening and closing tags of
  // the paragraph leaf node (the schema requires at least one leaf node, and
  // the first valid child of a doc is the paragraph node)
  if (doc.content.size - DEFAULT_TOKEN_SIZE === 0) {
    return false;
  }

  let from: number;
  let to: number;
  if (tr.selection.from !== tr.selection.to) {
    // replace only within selection
    [from, to] = [tr.selection.from, tr.selection.to];
  } else {
    // replace throughout document if nothing is selected
    // -2 because nodeSize captures the opening and closing tags as well
    // note: can get the same value using doc.content.size
    [from, to] = [0, doc.nodeSize - DEFAULT_TOKEN_SIZE];
  }

  doc.nodesBetween(from, to, (node, pos) => {
    return replaceNode({ tr, node, searchString, replaceString, pos });
  });

  if (!tr.docChanged) {
    return false;
  }

  if (dispatch) {
    dispatch(tr);
  }

  return true;
};

export const performHighlightReplace = (highlightReplaceOptions: {
  decorationSet: DecorationSet,
  stringToHighlight: string,
  stringToReplace: string,
  pos: number,
}): Command => (state, dispatch) => {
  const { tr } = state;

  const {
    decorationSet,
    stringToHighlight: searchString,
    stringToReplace: replaceString,
    pos
  } = highlightReplaceOptions;

  if (!decorationSet) {
    return false;
  }

  const matchingDecorations = decorationSet.find(pos, pos);
  // either 0 or 1 decorations are expected because the 'range' given
  // to decorationSet.find is exactly where the user had clicked, so
  // it can only either be highlighted or not be highlighted
  if (matchingDecorations.length === 1) {
    const { from, to } = matchingDecorations[0];
    state.doc.nodesBetween(from, to, node => {
      if (!node.isText || !node.text || !node.text.includes(searchString)) {
        return;
      }
      const fromResolved = tr.mapping.map(from);
      const toResolved = tr.mapping.map(to);
      // replace only at the clicked position
      tr.insertText(replaceString, fromResolved, toResolved);
    });

    if (dispatch) {
      dispatch(tr);
    }

    return true;
  }

  return false;
}
