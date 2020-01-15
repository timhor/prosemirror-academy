import { Schema, NodeSpec, MarkSpec } from 'prosemirror-model';

const pDOM = ['p', 0];

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
      return pDOM;
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
        getAttrs: (node: HTMLElement) => node.style.fontWeight !== 'normal' && null,
      },
      {
        style: 'font-weight',
        getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
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
