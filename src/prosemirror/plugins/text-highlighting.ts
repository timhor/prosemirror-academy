import { Plugin, PluginKey, StateField, Transaction, EditorState } from 'prosemirror-state';
import { DecorationSet, Decoration, EditorView } from 'prosemirror-view';
import { Node } from 'prosemirror-model';
import { performHighlightReplace } from '../commands';

export const pluginKey = new PluginKey('textHighlighting');

export type TextHighlightingPluginState = {
  stringToHighlight: string | null;
  stringToReplace: string | null;
};

const createInlineDecorations = (
  pos: number,
  node: Node,
  stringToHighlight: string,
): Decoration[] | null => {
  if (!node.text) {
    return null;
  }
  const decorations: Decoration[] = [];
  const matches = node.text.matchAll(RegExp(stringToHighlight, 'g'));
  for (const match of matches) {
    const { index } =  match;
    if (typeof index === 'number') {
      // need to offset by `pos` because the values of `from` and `to` in Decoration.inline are relative to
      // the position of `node` on the document (without it, indexOf would always return the same number
      // even for nodes not on the first line)
      const startPos = pos + index;
      const endPos = startPos + stringToHighlight.length;
      decorations.push(
        Decoration.inline(startPos, endPos, {
          nodeName: 'strong',
          class: 'text-highlight',
        }),
      );
    }
  }
  return decorations;
};

const createHighlightDecorations = (newEditorState: EditorState, stringToHighlight: string) => {
  const decorations: Decoration[] = [];
  const textNodeType = newEditorState.schema.nodes.text; // this is a node TYPE, not the node itself
  newEditorState.doc.nodesBetween(
    0,
    newEditorState.doc.nodeSize - 2,
    (node, pos) => {
      if (node.type !== textNodeType || !node.text) {
        return;
      }

      // check for substring instead of exact match because for something like <p>word word match word</p>,
      // node.text would be 'word word match word'
      if (node.text.includes(stringToHighlight)) {
        const inlineDecorations = createInlineDecorations(pos, node, stringToHighlight);
        if (inlineDecorations) {
          decorations.push(...inlineDecorations);
        }
      }
    },
  );
  return decorations;
}

export const createTextHighlightingPlugin = (): Plugin<StateField<
  TextHighlightingPluginState
>> => {
  return new Plugin({
    key: pluginKey,
    state: {
      init() {
        return {
          stringToHighlight: null, // highlight nothing to begin with
          stringToReplace: null,
          decorationSet: DecorationSet.empty
        };
      },
      apply(tr: Transaction, oldPluginState: TextHighlightingPluginState, _, newEditorState: EditorState) {
        const metaPluginState: TextHighlightingPluginState = tr.getMeta(pluginKey) || {};

        // metaPluginState.stringToHighlight is only set on button click, so it would be undefined if
        // the user types into the document - need to get the string from oldPluginState in that case
        const stringToHighlight =
          metaPluginState.stringToHighlight || oldPluginState.stringToHighlight;
        const stringToReplace =
          metaPluginState.stringToReplace || oldPluginState.stringToReplace;

        if (stringToReplace !== oldPluginState.stringToReplace) {
         return {
           ...oldPluginState,
           stringToReplace,
         };
        }

        // performance optimisations:
        // - this only happens when the 'Find' button is clicked and the search string is non-empty
        // - tr.docChanged is also needed to trigger the highlighting again after the user modifies the
        //   document, e.g. by typing the word being searched for again
        if (stringToHighlight !== null && (stringToHighlight || tr.docChanged)) {
          const decorations: Decoration[] = createHighlightDecorations(
            newEditorState,
            stringToHighlight,
          );

          return {
            ...oldPluginState,
            decorationSet: DecorationSet.create(newEditorState.doc, decorations),
            stringToHighlight,
          };
        }

        return {
          ...oldPluginState,
          decorationSet: null
        };
      },
    },
    props: {
      decorations(state) {
        return pluginKey.getState(state).decorationSet;
      },
      handleClickOn(view: EditorView, pos: number, node: Node, nodePos: number) {
        const { state, dispatch } = view;
        const {
          decorationSet,
          stringToHighlight,
          stringToReplace,
        } = pluginKey.getState(state);

        return performHighlightReplace({decorationSet, stringToHighlight, stringToReplace, pos})(state, dispatch);
      }
    },
  });
}
