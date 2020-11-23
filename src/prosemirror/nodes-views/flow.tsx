import React from 'react';
import ReactDOM from 'react-dom';
import ReactFlow, {
  Background,
  BackgroundVariant,
  OnLoadParams,
  Elements as FlowElements,
} from 'react-flow-renderer';
import { Node as PMNode } from 'prosemirror-model';
import { EditorView, Decoration, NodeView } from 'prosemirror-view';

type MutationSelection = {
  type: 'selection';
  target: Element;
};

type ElementAttributes = {
  [keyof: string]: any;
};

type BasicFlowProps = {
  elements: FlowElements;
};

const onLoad = (instance: OnLoadParams) => {
  instance.fitView();
};

const BasicFlow: React.FC<BasicFlowProps> = ({ elements }) => (
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

const convertElementAttrs = (elements: ElementAttributes): FlowElements => {
  return elements as FlowElements;
};

class FlowView implements NodeView {
  dom: HTMLElement;

  constructor(node: PMNode, view: EditorView) {
    const elements: ElementAttributes = [];
    node.forEach((childNode: PMNode) => {
      const elementAttrs = {
        ...childNode.attrs,
      };
      elements.push(elementAttrs);
    });
    this.dom = document.createElement('figure');
    this.dom.classList.add('flow');

    ReactDOM.render(
      <BasicFlow elements={convertElementAttrs(elements)} />,
      this.dom,
    );
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
