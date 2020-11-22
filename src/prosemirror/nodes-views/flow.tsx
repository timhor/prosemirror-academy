import React from 'react';
import ReactDOM from 'react-dom';
import ReactFlow, {
  Background,
  BackgroundVariant,
  OnLoadParams,
} from 'react-flow-renderer';
import { Node as PMNode } from 'prosemirror-model';
import { EditorView, Decoration, NodeView } from 'prosemirror-view';

const elements = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
  // you can also pass a React component as a label
  { id: '2', data: { label: <div>Node 2</div> }, position: { x: 100, y: 100 } },
  { id: 'e1-2', source: '1', target: '2', animated: true },
];

const onLoad = (instance: OnLoadParams) => {
  console.log(instance);
  instance.fitView();
};

const BasicFlow = () => (
  <ReactFlow
    onLoad={onLoad}
    snapToGrid={true}
    snapGrid={[15, 15]}
    elements={elements}
    maxZoom={1.5}
  >
    <Background variant={BackgroundVariant.Lines} />
  </ReactFlow>
);

type MutationSelection = {
  type: 'selection';
  target: Element;
};

class FlowView implements NodeView {
  dom: HTMLElement;

  constructor(node: PMNode, view: EditorView) {
    this.dom = document.createElement('figure');
    this.dom.classList.add('flow');

    ReactDOM.render(<BasicFlow />, this.dom);
  }

  update(node: PMNode) {
    console.log('hey', node);

    return true;
  }

  stopEvent(event: Event) {
    return true;
  }

  ignoreMutation(mut: MutationRecord | MutationSelection) {
    return true;
  }
}

const view = (
  node: PMNode,
  view: EditorView,
  getPos: boolean | (() => number),
  decorations: Decoration[],
): NodeView => {
  return new FlowView(node, view);
};

export { view };
