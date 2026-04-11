/**
 * Batch-fix landing site page navbars
 */
const fs = require('fs');

// BLOG PAGES: Old desktop nav
const blogOldDesktop = `          <a href="../#features" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Features</a>
          <a href="../#pricing" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Pricing</a>
          <a href="./" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Blog</a>
          <a href="https://app.tryblackcat.com/signup" class="cta-button-sm text-sm font-semibold px-5 py-2.5 rounded-full text-white">Get Started Free</a>`;

const blogOldDesktopActive = `          <a href="../#features" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Features</a>
          <a href="../#pricing" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Pricing</a>
          <a href="./" class="nav-link text-sm text-white transition-colors duration-200">Blog</a>
          <a href="https://app.tryblackcat.com/signup" class="cta-button-sm text-sm font-semibold px-5 py-2.5 rounded-full text-white">Get Started Free</a>`;

const blogNewDesktop = `          <a href="../#features" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Features</a>
          <a href="../#pricing" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Pricing</a>
          <a href="../tools/airbnb-profit-calculator.html" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Calculator</a>
          <a href="../tools/airbnb-profit-tracker-spreadsheet.html" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Spreadsheet</a>
          <a href="./" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Blog</a>
          <a href="https://app.tryblackcat.com/signup" class="cta-button-sm text-sm font-semibold px-5 py-2.5 rounded-full text-white">Get Started Free</a>`;

const blogOldMobile = `        <a href="../#features" class="mobile-nav-link text-xl font-display font-semibold text-white">Features</a>
        <a href="../#pricing" class="mobile-nav-link text-xl font-display font-semibold text-white">Pricing</a>
        <a href="./" class="mobile-nav-link text-xl font-display font-semibold text-white">Blog</a>
        <a href="https://app.tryblackcat.com/signup" class="cta-button-sm text-center text-base font-semibold px-6 py-3 rounded-full text-white mt-4">Get Started Free</a>`;

const blogNewMobile = `        <a href="../#features" class="mobile-nav-link text-xl font-display font-semibold text-white">Features</a>
        <a href="../#pricing" class="mobile-nav-link text-xl font-display font-semibold text-white">Pricing</a>
        <a href="../tools/airbnb-profit-calculator.html" class="mobile-nav-link text-xl font-display font-semibold text-white">Calculator</a>
        <a href="../tools/airbnb-profit-tracker-spreadsheet.html" class="mobile-nav-link text-xl font-display font-semibold text-white">Spreadsheet</a>
        <a href="./" class="mobile-nav-link text-xl font-display font-semibold text-white">Blog</a>
        <a href="https://app.tryblackcat.com/signup" class="cta-button-sm text-center text-base font-semibold px-6 py-3 rounded-full text-white mt-4">Get Started Free</a>`;

// SPREADSHEETS BLOG — has Live Demo link
const ssOldDesktop = `          <a href="../#features" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Features</a>
          <a href="../#pricing" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Pricing</a>
          <a href="./" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Blog</a>
          <a href="https://app.tryblackcat.com/demo" class="nav-link text-sm text-accent-green hover:text-green-300 transition-colors duration-200 font-medium">Live Demo</a>
          <a href="https://app.tryblackcat.com/signup" class="cta-button-sm text-sm font-semibold px-5 py-2.5 rounded-full text-white">Get Started Free</a>`;

const ssOldMobile = `        <a href="../#features" class="mobile-nav-link text-xl font-display font-semibold text-white">Features</a>
        <a href="../#pricing" class="mobile-nav-link text-xl font-display font-semibold text-white">Pricing</a>
        <a href="./" class="mobile-nav-link text-xl font-display font-semibold text-white">Blog</a>
        <a href="https://app.tryblackcat.com/demo" class="mobile-nav-link text-xl font-display font-semibold text-accent-green">Live Demo</a>
        <a href="https://app.tryblackcat.com/signup" class="cta-button-sm text-center text-base font-semibold px-6 py-3 rounded-full text-white mt-4">Get Started Free</a>`;

// TOOLS/CALCULATOR — has Live Demo
const calcOldDesktop = `          <a href="../#features" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Features</a>
          <a href="../#pricing" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Pricing</a>
          <a href="../blog/" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Blog</a>
          <a href="https://app.tryblackcat.com/demo" class="nav-link text-sm text-accent-green hover:text-green-300 transition-colors duration-200 font-medium">Live Demo</a>
          <a href="https://app.tryblackcat.com/signup" class="cta-button-sm text-sm font-semibold px-5 py-2.5 rounded-full text-white">Get Started Free</a>`;

const calcNewDesktop = `          <a href="../#features" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Features</a>
          <a href="../#pricing" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Pricing</a>
          <a href="./airbnb-profit-calculator.html" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Calculator</a>
          <a href="./airbnb-profit-tracker-spreadsheet.html" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Spreadsheet</a>
          <a href="../blog/" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Blog</a>
          <a href="https://app.tryblackcat.com/signup" class="cta-button-sm text-sm font-semibold px-5 py-2.5 rounded-full text-white">Get Started Free</a>`;

const calcOldMobile = `        <a href="../#features" class="mobile-nav-link text-xl font-display font-semibold text-white">Features</a>
        <a href="../#pricing" class="mobile-nav-link text-xl font-display font-semibold text-white">Pricing</a>
        <a href="../blog/" class="mobile-nav-link text-xl font-display font-semibold text-white">Blog</a>
        <a href="https://app.tryblackcat.com/demo" class="mobile-nav-link text-xl font-display font-semibold text-accent-green">Live Demo</a>
        <a href="https://app.tryblackcat.com/signup" class="cta-button-sm text-center text-base font-semibold px-6 py-3 rounded-full text-white mt-4">Get Started Free</a>`;

const calcNewMobile = `        <a href="../#features" class="mobile-nav-link text-xl font-display font-semibold text-white">Features</a>
        <a href="../#pricing" class="mobile-nav-link text-xl font-display font-semibold text-white">Pricing</a>
        <a href="./airbnb-profit-calculator.html" class="mobile-nav-link text-xl font-display font-semibold text-white">Calculator</a>
        <a href="./airbnb-profit-tracker-spreadsheet.html" class="mobile-nav-link text-xl font-display font-semibold text-white">Spreadsheet</a>
        <a href="../blog/" class="mobile-nav-link text-xl font-display font-semibold text-white">Blog</a>
        <a href="https://app.tryblackcat.com/signup" class="cta-button-sm text-center text-base font-semibold px-6 py-3 rounded-full text-white mt-4">Get Started Free</a>`;

// PRIVACY/TERMS — old Waitlist CTA
const legalOldDesktop = `          <a href="./#features" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Features</a>
          <a href="./#pricing" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Pricing</a>
          <a href="./blog/" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Blog</a>
          <a href="./#waitlist-bottom" class="cta-button-sm text-sm font-semibold px-5 py-2.5 rounded-full text-white">Join the Waitlist</a>`;

const legalNewDesktop = `          <a href="./#features" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Features</a>
          <a href="./#pricing" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Pricing</a>
          <a href="./tools/airbnb-profit-calculator.html" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Calculator</a>
          <a href="./tools/airbnb-profit-tracker-spreadsheet.html" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Spreadsheet</a>
          <a href="./blog/" class="nav-link text-sm text-neutral-400 hover:text-white transition-colors duration-200">Blog</a>
          <a href="https://app.tryblackcat.com/signup" class="cta-button-sm text-sm font-semibold px-5 py-2.5 rounded-full text-white">Get Started Free</a>`;

function fix(filePath, replacements) {
  let html = fs.readFileSync(filePath, 'utf-8');
  let count = 0;
  for (let [old, rep] of replacements) {
    // Normalize to match either \r\n or \n
    const oldCRLF = old.replace(/\n/g, '\r\n');
    if (html.includes(oldCRLF)) {
      html = html.replace(oldCRLF, rep.replace(/\n/g, '\r\n'));
      count++;
    } else if (html.includes(old)) {
      html = html.replace(old, rep);
      count++;
    }
  }
  fs.writeFileSync(filePath, html, 'utf-8');
  return count;
}

// Blog index (active Blog link)
console.log('blog/index.html:', fix('blog/index.html', [
  [blogOldDesktopActive, blogNewDesktop],
  [blogOldMobile, blogNewMobile],
]), 'nav replacements');

// Blog articles (9 pages, same pattern — some have the Live Demo variant)
const blogArticles = [
  'blog/how-to-calculate-airbnb-profit.html',
  'blog/airbnb-tax-deductions-2026.html',
  'blog/airbnb-vs-vrbo-which-is-more-profitable.html',
  'blog/airbnb-pricing-strategy.html',
  'blog/airbnb-schedule-e-guide.html',
  'blog/airbnb-expense-categories-complete-list.html',
  'blog/airbnb-cleaning-costs-guide.html',
  'blog/is-your-airbnb-profitable-5-warning-signs.html',
];
for (const f of blogArticles) {
  console.log(f + ':', fix(f, [
    [blogOldDesktop, blogNewDesktop],
    [blogOldMobile, blogNewMobile],
  ]), 'nav replacements');
}

// Spreadsheet blog (has Live Demo variant)
console.log('spreadsheets-vs:', fix('blog/airbnb-spreadsheets-vs-profit-tracking-software.html', [
  [ssOldDesktop, blogNewDesktop],
  [ssOldMobile, blogNewMobile],
]), 'nav replacements');

// Calculator tool
console.log('calculator:', fix('tools/airbnb-profit-calculator.html', [
  [calcOldDesktop, calcNewDesktop],
  [calcOldMobile, calcNewMobile],
]), 'nav replacements');

// Privacy & Terms
for (const f of ['privacy.html', 'terms.html']) {
  console.log(f + ':', fix(f, [
    [legalOldDesktop, legalNewDesktop],
  ]), 'nav replacements');
}

console.log('Done!');

