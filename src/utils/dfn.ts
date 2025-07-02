/// <reference types="mdast-util-directive" />
import type { Root } from "mdast";
import { visit } from "unist-util-visit";

export const remarkDfn =
  () =>
  (tree: Root): void => {
    visit(tree, (node) => {
      if (
        node.type === `containerDirective` ||
        node.type === `leafDirective` ||
        node.type === `textDirective`
      ) {
        if (node.name !== `dfn`) return;

        if (typeof node.data === `undefined`) {
          node.data = {};
        }
        const firstChild = node.children[0];

        // to keep things DRY, we'll just snag the <ruby>
        // or immediate child text node value and use it
        // as the id attribute if an explicit one isn't
        // defined
        if (
          (firstChild.type === `ruby` || firstChild.type === `text`) &&
          typeof node.attributes?.id === `undefined`
        ) {
          Object.assign((node.attributes ??= {}), {
            id:
              firstChild.type === `text`
                ? firstChild.value
                : firstChild.children[0].value
          });
        }

        node.data.hName = node.name;
        node.data.hProperties = {
          id: node.attributes?.id
        };
      }
    });
  };

export default remarkDfn;
