#!/usr/bin/env python3
"""
One-shot installer: inject the Microsoft Clarity snippet into every HTML page's
<head>. Idempotent — checks for the Clarity project ID before inserting, so
re-running this is a no-op.
"""
import sys

SNIPPET = """    <!-- Microsoft Clarity (session replay + heatmaps) -->
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "wykpb8uzfm");
    </script>
"""

ok = skip = nohead = 0
for filepath in sys.argv[1:]:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    if "wykpb8uzfm" in content:
        print(f"skip (already installed)  {filepath}")
        skip += 1
        continue
    if "</head>" not in content:
        print(f"NO </head>  {filepath}")
        nohead += 1
        continue
    new_content = content.replace("</head>", SNIPPET + "</head>", 1)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"installed  {filepath}")
    ok += 1

print(f"\nSummary: {ok} installed, {skip} already had it, {nohead} no <head>")
