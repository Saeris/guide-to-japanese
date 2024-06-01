import { visit } from "unist-util-visit";
import type { Visitor, VisitorResult } from "unist-util-visit";
import type { Plugin, Transformer } from "unified";
import type { Data, Parent, PhrasingContent, Root, Text } from "mdast";
import { findAllBetween } from "unist-util-find-between-all";
import { findAllBefore } from "unist-util-find-all-before";
import { findAllAfter } from "unist-util-find-all-after";
import { findAfter } from "unist-util-find-after";
import { u } from "unist-builder";

type QuotationData = Data;

interface Quotation extends Parent {
  /**
   * Node type of mdast Quotation.
   */
  type: "quotation";
  /**
   * Children of paragraph.
   */
  children: PhrasingContent[];
  /**
   * Data associated with the mdast paragraph.
   */
  data?: QuotationData | undefined;
}

declare module "mdast" {
  interface PhrasingContentMap {
    quotation: Quotation;
  }

  interface RootContentMap {
    quotation: Quotation;
  }
}

export const REGEX = /""(?![\s+])([\s\S]*?)(?<![\s+])""/;
export const REGEX_GLOBAL = /""(?![\s+])([\s\S]*?)(?<![\s+])""/g;

export const REGEX_STARTING = /""(?![\s]|""\s)/;
export const REGEX_STARTING_GLOBAL = /""(?![\s]|""\s)/g;

export const REGEX_ENDING = /(?<!\s|\s\+|\s\+|\s\+|\s\+)""/;
export const REGEX_ENDING_GLOBAL = /(?<!\s|\s\+|\s\+|\s\+|\s\+)""/g;

export const REGEX_EMPTY = /""\s*""/;
export const REGEX_EMPTY_GLOBAL = /""\s*""/g;

/**
 * This plugin turns ""text"" into a <q>text</q>
 *
 * for example:
 *
 * Here is ""inserted text""
 */
export const plugin: Plugin<void[], Root> = () => {
  /**
   * constructs a custom <q> node
   */
  const constructQuotationNode = (children: PhrasingContent[]): Quotation => ({
    type: `quotation`,
    children,
    data: {
      hName: `q`
    }
  });

  /**
   * visits the Text nodes to match with the ins syntax (++inserted text++)
   */
  const visitorFirst: Visitor<Text, Parent> = (
    node,
    index,
    parent
  ): VisitorResult => {
    /* istanbul ignore next */
    if (!parent || typeof index === `undefined`) return;

    if (!REGEX.test(node.value)) return;

    const children: PhrasingContent[] = [];
    const value = node.value;
    let tempValue = ``;
    let prevMatchIndex = 0;
    let prevMatchLength = 0;

    const matches = Array.from(value.matchAll(REGEX_GLOBAL));

    for (const match of matches) {
      const [matched, insertedText] = match;
      const mIndex = match.index;
      const mLength = matched.length;

      // could be a text part before each matched part
      const textPartIndex = prevMatchIndex + prevMatchLength;

      prevMatchIndex = mIndex;
      prevMatchLength = mLength;

      // if there is a text part before
      if (mIndex > textPartIndex) {
        const textValue = value.substring(textPartIndex, mIndex);

        const textNode = u(`text`, textValue);
        children.push(textNode);
      }

      const insertNode = constructQuotationNode([
        { type: `text`, value: insertedText.trim() }
      ]);

      children.push(insertNode);

      // control for the last text node if exists after the last match
      tempValue = value.slice(mIndex + mLength);
    }

    // if there is still text after the last match
    if (tempValue) {
      const textNode = u(`text`, tempValue);
      children.push(textNode);
    }

    if (children.length) parent.children.splice(index, 1, ...children);
  };

  /**
   * visits the Text nodes to find the ins syntax (++inserted **bold** text++)
   * if parent contains other content phrases
   */
  const visitorSecond: Visitor<Text, Parent> = (
    node,
    index,
    parent
  ): VisitorResult => {
    /* istanbul ignore next */
    if (!parent || typeof index === `undefined`) return;

    // control if the Text node matches with "starting ins regex"
    if (!REGEX_STARTING.test(node.value)) return;

    const openingNode = node;

    // control if any next child Text node of the parent has "ending ins regex"
    const closingNode = findAfter(
      parent,
      openingNode,
      (n) => n.type === `text` && REGEX_ENDING.test((n as Text).value)
    );

    if (!closingNode) return;

    // now, ensured that the parent has a ins element between opening Text node and closing Text nodes

    const beforeChildren = findAllBefore(
      parent,
      openingNode
    ) as PhrasingContent[];
    const mainChildren = findAllBetween(
      parent,
      openingNode,
      closingNode
    ) as PhrasingContent[];
    const afterChildren = findAllAfter(
      parent,
      closingNode
    ) as PhrasingContent[];

    /********************* OPENING NODE ***********************/

    // let's analyze the opening Text node
    const value = openingNode.value;

    const match = Array.from(value.matchAll(REGEX_STARTING_GLOBAL))[0];

    const [matched] = match;
    const mLength = matched.length;
    const mIndex = match.index;

    // if there is a text part before
    if (mIndex > 0) {
      const textValue = value.substring(0, mIndex);

      const textNode = u(`text`, textValue);
      beforeChildren.push(textNode);
    }

    // if there is a text part after
    if (value.length > mIndex + mLength) {
      const textValue = value.slice(mIndex + mLength);

      const textNode = u(`text`, textValue);
      mainChildren.unshift(textNode);
    }

    /********************* CLOSING NODE ***********************/

    // let's analyze the closing Text node
    const value_ = (closingNode as Text).value;

    const match_ = Array.from(value_.matchAll(REGEX_ENDING_GLOBAL))[0];

    const [matched_] = match_;
    const mLength_ = matched_.length;
    const mIndex_ = match_.index;

    // if there is a text part before
    if (mIndex_ > 0) {
      const textValue = value_.substring(0, mIndex_);

      const textNode = u(`text`, textValue);
      mainChildren.push(textNode);
    }

    // if there is a text part after
    if (value_.length > mIndex_ + mLength_) {
      const textValue = value_.slice(mIndex_ + mLength_);

      const textNode = u(`text`, textValue);
      afterChildren.unshift(textNode);
    }

    // now it is time to construct a ins node
    const insertNode = constructQuotationNode(mainChildren);

    parent.children = [...beforeChildren, insertNode, ...afterChildren];

    return index; // in order to re-visit the same node and children
  };

  /**
   * visits the Text nodes to find empty markers (==== or == ==)
   */
  const visitorThird: Visitor<Text, Parent> = (
    node,
    index,
    parent
  ): VisitorResult => {
    /* istanbul ignore next */
    if (!parent || typeof index === `undefined`) return;

    if (!REGEX_EMPTY.test(node.value)) return;

    const children: PhrasingContent[] = [];
    const value = node.value;
    let tempValue = ``;
    let prevMatchIndex = 0;
    let prevMatchLength = 0;

    const matches = Array.from(value.matchAll(REGEX_EMPTY_GLOBAL));

    for (const match of matches) {
      const [matched] = match;
      const mIndex = match.index;
      const mLength = matched.length;

      // could be a text part before each matched part
      const textPartIndex = prevMatchIndex + prevMatchLength;

      prevMatchIndex = mIndex;
      prevMatchLength = mLength;

      // if there is a text part before
      if (mIndex > textPartIndex) {
        const textValue = value.substring(textPartIndex, mIndex);

        const textNode = u(`text`, textValue);
        children.push(textNode);
      }

      // empty marker
      const markerNode = constructQuotationNode([]);

      children.push(markerNode);

      // control for the last text node if exists after the last match
      tempValue = value.slice(mIndex + mLength);
    }

    // if there is still text after the last match
    if (tempValue) {
      const textNode = u(`text`, tempValue);
      children.push(textNode);
    }

    if (children.length) parent.children.splice(index, 1, ...children);
  };

  const transformer: Transformer<Root> = (tree) => {
    // to find insert syntax in a Text node
    visit(tree, `text`, visitorFirst);

    // to find insert syntax if the parent contains other content phrases
    visit(tree, `text`, visitorSecond);

    // to find empty ins (++++ or ++ ++)
    visit(tree, `text`, visitorThird);
  };

  return transformer;
};

export default plugin;
