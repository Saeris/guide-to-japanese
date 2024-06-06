import type { Data, Parent, PhrasingContent } from "mdast";

type RubyData = Data;

interface Ruby extends Parent {
  type: "ruby";
  children: PhrasingContent[];
  data?: RubyData | undefined;
}

declare module "mdast" {
  interface PhrasingContentMap {
    ruby: Ruby;
  }

  interface RootContentMap {
    ruby: Ruby;
  }
}
