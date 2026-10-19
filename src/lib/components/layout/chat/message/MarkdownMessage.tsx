import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
export default function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="min-w-0 break-words [overflow-wrap:anywhere] text-body leading-relaxed text-[color:var(--message-ink,var(--color-operational-ink))] [&_p]:whitespace-pre-wrap [&_p+p]:mt-3 [&_strong]:font-bold [&_h1]:text-body! [&_h2]:text-body! [&_h3]:text-body! [&_h1]:font-bold [&_h2]:font-semi-bold [&_h3]:font-semi-bold [&_h1]:my-3 [&_h2]:my-3 [&_h3]:my-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-operational-border [&_blockquote]:pl-3 [&_blockquote]:text-[color:var(--message-muted,var(--color-operational-muted))] [&_pre]:overflow-auto [&_pre]:rounded-medium [&_pre]:bg-white [&_pre]:p-3 [&_code]:rounded-small [&_code]:bg-white [&_code]:px-1 [&_a]:text-[color:var(--message-link,var(--color-hyperlink))] [&_a]:underline">
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        allowedElements={["p", "strong", "em", "del", "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "pre", "code", "a", "br", "hr"]}
        components={{
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}>
        {content}
      </Markdown>
    </div>
  );
}
