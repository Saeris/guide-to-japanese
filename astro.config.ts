import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import rehypeRewrite from "rehype-rewrite";
import remarkRuby from "remark-denden-ruby";
import {
  remarkDefinitionList,
  defListHastHandlers,
} from "remark-definition-list";
//import { remarkAlert } from "remark-github-blockquote-alert";
import remarkAlerts from "remark-alerts";
import remarkIns from "remark-ins";
import remarkSqueezeParagraphs from "remark-squeeze-paragraphs";
import remarkFlexibleMarkers from "remark-flexible-markers";
import remarkEmbedder from "@remark-embedder/core";
import oembedTransformer from "@remark-embedder/transformer-oembed";
import {
  remarkExtendedTable,
  extendedTableHandlers,
} from "remark-extended-table";
import remarkQuotation from "./src/quotation";

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [
      remarkAlerts,
      remarkDefinitionList,
      remarkFlexibleMarkers,
      remarkIns,
      remarkQuotation,
      remarkRuby,
      remarkSqueezeParagraphs,
      remarkExtendedTable,
      [
        // @ts-expect-error
        remarkEmbedder.default,
        {
          // @ts-expect-error
          transformers: [oembedTransformer.default],
        },
      ],
    ],
    rehypePlugins: [
      [
        rehypeRewrite,
        {
          rewrite: (node) => {
            if (node.type == "element" && node.tagName == "ruby") {
              node.properties = { ...node.properties, lang: "ja" };
            }
          },
        },
      ],
    ],
    remarkRehype: {
      handlers: {
        ...defListHastHandlers,
        ...extendedTableHandlers,
      },
    },
  },
  integrations: [mdx({})],
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
  devToolbar: {
    enabled: false,
  },
});
