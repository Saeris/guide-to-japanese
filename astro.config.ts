import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import vercel from "@astrojs/vercel/serverless";
import react from "@astrojs/react";
import rehypeSlug from "rehype-slug";
import rehypeRewrite from "rehype-rewrite";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkRuby from "remark-denden-ruby";
import {
  remarkDefinitionList,
  defListHastHandlers
} from "remark-definition-list";
import remarkAlerts from "remark-alerts";
import remarkIns from "remark-ins";
import remarkSqueezeParagraphs from "remark-squeeze-paragraphs";
import remarkFlexibleMarkers from "remark-flexible-markers";
import remarkEmbedder from "@remark-embedder/core";
import oembedTransformer from "@remark-embedder/transformer-oembed";
import remarkSectionize from "remark-sectionize";
import remarkCaptions from "remark-captions";
import remarkDirective from "remark-directive";
import {
  remarkExtendedTable,
  extendedTableHandlers
} from "remark-extended-table";
import remarkQuotation from "./src/quotation";

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [
      remarkRuby,
      remarkDirective,
      remarkAlerts,
      remarkDefinitionList,
      remarkFlexibleMarkers,
      remarkIns,
      remarkQuotation,
      remarkSqueezeParagraphs,
      remarkExtendedTable,
      remarkSectionize,
      remarkCaptions,
      [
        // @ts-expect-error
        remarkEmbedder.default,
        {
          // @ts-expect-error
          transformers: [oembedTransformer.default]
        }
      ]
    ],
    rehypePlugins: [
      rehypeHeadingIds,
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: `wrap`
        }
      ],
      [
        rehypeRewrite,
        {
          rewrite: (node): void => {
            if (node.type === `element` && node.tagName === `ruby`) {
              node.properties = {
                ...node.properties,
                lang: `ja`
              };
            }
          }
        }
      ]
    ],
    remarkRehype: {
      handlers: {
        ...defListHastHandlers,
        ...extendedTableHandlers
      }
    }
  },
  integrations: [mdx({}), react()],
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: {
    service: {
      entrypoint: `astro/assets/services/sharp`
    }
  },
  devToolbar: {
    enabled: false
  },
  output: `server`,
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  })
});
