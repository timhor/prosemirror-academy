import { Plugin, PluginKey, StateField, Transaction, EditorState } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';
import { Node } from 'prosemirror-model';

export const pluginKey = new PluginKey('textHighlighting');

export type TextHighlightingPluginState = {
  stringToHighlight: string | null;
};

const createNodeDecoration = (pos: number, node: Node): Decoration => {
  const startPos = pos;
  const endPos = pos + node.nodeSize;
  return Decoration.node(startPos, endPos, {
    class: 'text-highlight',
  });
}

const createInlineDecoration = (pos: number, node: Node): Decoration | null => {
  if (!node.text) {
    return null;
  }

  // need to offset by `pos` because the values of `from` and `to` in Decoration.inline are relative to
  // the position of `node` on the document (without it, indexOf would always return the same number
  // even for nodes not on the first line)
  // TODO: remove hardcoding
  const startPos = pos + node.text?.indexOf('text');
  const endPos = pos + node.text?.indexOf('text') + 'text'.length;
  return Decoration.inline(startPos, endPos, {
    nodeName: 'strong',
    class: 'text-highlight',
  });
};

export const createTextHighlightingPlugin = (): Plugin<StateField<
  TextHighlightingPluginState
>> => {
  return new Plugin({
    key: pluginKey,
    state: {
      init() {
        return {
          stringToHighlight: null, // highlight nothing to begin with
          decorationSet: DecorationSet.empty
        };
      },
      apply(tr: Transaction, oldPluginState: TextHighlightingPluginState, _, newEditorState: EditorState) {
        // fromMetaStringToHighlight is only set on button click, so it would be undefined if the user
        // types into the document - need to get the string from oldPluginState in that case
        const fromMetaStringToHighlight = tr.getMeta(pluginKey);
        const stringToHighlight = fromMetaStringToHighlight || oldPluginState.stringToHighlight;

        // performance optimisations:
        // - this only happens when the 'Find' button is clicked, the search string is non-empty and it's
        //   different from the previous search string
        // - tr.docChanged is also needed to trigger the highlighting again after the user modifies the
        //   document, e.g. by typing the word being searched for again
        if ((stringToHighlight && stringToHighlight !== oldPluginState.stringToHighlight) || tr.docChanged) {
          const decorations: Decoration[] = [];
          const textNodeType = newEditorState.schema.nodes.text; // this is a node TYPE, not the node itself
          newEditorState.doc.nodesBetween(
            0,
            newEditorState.doc.nodeSize - 2,
            (node, pos) => {
              if (node.type !== textNodeType || !node.text) {
                return;
              }

              // this distinction is needed as ProseMirror 'merges' nodes of the same type
              // - node decoration would work for <p>word <strong>match</strong> word</p> (node.text === 'match')
              // - inline decoration required for <p>word word match word</p> (node.text === 'word word match word')
              if (node.text === stringToHighlight) {
                decorations.push(createNodeDecoration(pos, node));
              } else if (node.text.includes(stringToHighlight)) {
                const inlineDecoration = createInlineDecoration(pos, node);
                if (inlineDecoration) {
                  decorations.push(inlineDecoration);
                }
              }
            },
          );

          return {
            ...oldPluginState,
            decorationSet: DecorationSet.create(newEditorState.doc, decorations),
            stringToHighlight,
          };
        }

        return oldPluginState;
      },
    },
    props: {
      decorations(state) {
        return pluginKey.getState(state).decorationSet;
      },
    },
  });
}
