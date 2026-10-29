/**
 * A script that runs while the browser reads the HTML, before React loads.
 * Pattern from the Next.js "Preventing Flash" guide: the type is
 * "text/javascript" in the built HTML and "text/plain" when React renders it in
 * the browser, which avoids React's development warning about <script> tags.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
