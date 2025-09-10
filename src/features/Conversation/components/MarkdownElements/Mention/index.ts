import Render from './Render';
import { createRemarkCustomTagWithAttributesPlugin } from '../remarkPlugins/createRemarkCustomTagWithAttributesPlugin';
import { MarkdownElement } from '../type';

const Mention: MarkdownElement = {
  Component: Render,
  remarkPlugin: createRemarkCustomTagWithAttributesPlugin('mention'),
  tag: 'mention',
};

export default Mention;