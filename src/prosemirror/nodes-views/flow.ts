import { Node as PMNode } from 'prosemirror-model';
import { EditorView, Decoration, NodeView } from 'prosemirror-view';

class FlowView implements NodeView {
  dom: HTMLElement;

  constructor(node: PMNode) {
    this.dom = document.createElement('div');
    this.dom.classList.add('lol');
    const x = document.createElement('span');
    x.innerHTML = 'YAY man';
    this.dom.appendChild(x);
  }

  update(node: PMNode) {
    console.log('hey', node);

    return true;
  }
}

const view = (
  node: PMNode,
  view: EditorView,
  getPos: boolean | (() => number),
  decorations: Decoration[],
): NodeView => {
  return new FlowView(node);
};

export { view };
