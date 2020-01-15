// https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
import {
  Schema,
  NodeSpec,
  MarkSpec,
  Node as ProseMirrorNode,
} from 'prosemirror-model';

// :: Object
// [Specs](#model.NodeSpec) for the nodes defined in this schema.
export const nodes: NodeSpec = {
  // :: NodeSpec The top level document node.
  doc: {
    content: 'block+',
  },

  // :: NodeSpec A plain paragraph textblock. Represented in the DOM
  // as a `<p>` element.
  paragraph: {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM() {
      return ['p', 0];
    },
  },

  // :: NodeSpec A heading textblock, with a `level` attribute that
  // should hold the number 1 to 6. Parsed and serialized as `<h1>` to
  // `<h6>` elements.
  heading: {
    attrs: { level: { default: 1 } },
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
    ],
    toDOM(node: ProseMirrorNode) {
      return ['h' + node.attrs.level, 0];
    },
  },

  // :: NodeSpec The text node.
  text: {
    group: 'inline',
  },
};

const strongDOM = ['strong', 0];

// :: Object [Specs](#model.MarkSpec) for the marks in the schema.
export const marks: MarkSpec = {
  strong: {
    parseDOM: [
      { tag: 'strong' },
      // This works around a Google Docs misbehavior where
      // pasted content will be inexplicably wrapped in `<b>`
      // tags with a font-weight normal.
      {
        tag: 'b',
        getAttrs: (node: HTMLElement) =>
          node.style.fontWeight !== 'normal' && null,
      },
      {
        style: 'font-weight',
        getAttrs: (value: string) =>
          /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
      },
    ],
    toDOM() {
      return strongDOM;
    },
  },
};

// :: Schema
// This schema roughly corresponds to the document schema used by
// [CommonMark](http://commonmark.org/), minus the list elements,
// which are defined in the [`prosemirror-schema-list`](#schema-list)
// module.
//
// To reuse elements from this schema, extend or read from its
// `spec.nodes` and `spec.marks` [properties](#model.Schema.spec).
export const schema = new Schema({ nodes, marks });
