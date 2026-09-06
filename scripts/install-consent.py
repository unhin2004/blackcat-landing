#!/usr/bin/env python3
"""
Consent Mode v2 for every HTML page. Idempotent.

Before: GA4 and Microsoft Clarity (session replay) loaded in <head> on
every page before the visitor saw the cookie banner, and "Decline" only
wrote a localStorage flag. Now: gtag starts with analytics_storage denied,
Clarity is not loaded at all until the visitor accepts, and app.js
upgrades consent (and loads Clarity) on Accept or when a stored
acceptance exists.
"""
import glob, re, sys

GA_OLD = re.compile(
    r"  <!-- Google Analytics -->\n  <script async src=\"https://www\.googletagmanager\.com/gtag/js\?id=G-0Y5H3YVKT4\"></script>\n  <script>\n    window\.dataLayer = window\.dataLayer \|\| \[\];\n    function gtag\(\)\{dataLayer\.push\(arguments\);\}\n    gtag\('js', new Date\(\)\);\n    gtag\('config', 'G-0Y5H3YVKT4'\);\n  </script>\n"
)
GA_NEW = """  <!-- Google Analytics (Consent Mode v2: denied until the visitor accepts) -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });
    try { if (localStorage.getItem('cookie-consent') === 'accepted') { gtag('consent', 'update', { analytics_storage: 'granted' }); } } catch (e) {}
    gtag('js', new Date());
    gtag('config', 'G-0Y5H3YVKT4');
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-0Y5H3YVKT4"></script>
"""
CLARITY_OLD = re.compile(
    r"    <!-- Microsoft Clarity \(session replay \+ heatmaps\) -->\n    <script type=\"text/javascript\">\n        \(function\(c,l,a,r,i,t,y\)\{\n            c\[a\]=c\[a\]\|\|function\(\)\{\(c\[a\]\.q=c\[a\]\.q\|\|\[\]\)\.push\(arguments\)\};\n            t=l\.createElement\(r\);t\.async=1;t\.src=\"https://www\.clarity\.ms/tag/\"\+i;\n            y=l\.getElementsByTagName\(r\)\[0\];y\.parentNode\.insertBefore\(t,y\);\n        \}\)\(window, document, \"clarity\", \"script\", \"wykpb8uzfm\"\);\n    </script>\n"
)
CLARITY_NEW = """    <!-- Microsoft Clarity (session replay + heatmaps) — loaded only after consent -->
    <script type="text/javascript">
        window.__bcLoadClarity = function () {
            if (window.__bcClarityLoaded) return;
            window.__bcClarityLoaded = true;
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "wykpb8uzfm");
        };
        try { if (localStorage.getItem('cookie-consent') === 'accepted') { window.__bcLoadClarity(); } } catch (e) {}
    </script>
"""

files = sorted(set(glob.glob("*.html") + glob.glob("blog/*.html") + glob.glob("tools/*.html") + glob.glob("downloads/*.html")))
ga = cl = 0
for f in files:
    s = open(f, encoding="utf-8").read()
    n = s
    n, k = GA_OLD.subn(GA_NEW, n); ga += k
    n, k2 = CLARITY_OLD.subn(CLARITY_NEW, n); cl += k2
    if n != s:
        open(f, "w", encoding="utf-8").write(n)
print(f"GA rewritten: {ga}, Clarity rewritten: {cl}, files: {len(files)}")
left = [f for f in files if "gtag('config', 'G-0Y5H3YVKT4');\n  </script>\n\n  <link" in open(f, encoding="utf-8").read()]
print("unconverted GA:", left)
