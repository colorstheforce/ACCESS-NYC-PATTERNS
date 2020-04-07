/**
 * Dependencies
 */

// ...

/**
 * Config
 */

const sass = {
  sourceMapEmbed: true,
  precision: 2,
  includePaths: [
    './node_modules', './src'
  ]
};

const modules = [
  {
    file: './src/scss/site-ar.scss',
    outDir: './dist/styles/',
    outFile: 'site-ar.css',
    sourceMapEmbed: sass.sourceMapEmbed,
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/scss/site-default.scss',
    outDir: './dist/styles/',
    outFile: 'site-default.css',
    sourceMapEmbed: sass.sourceMapEmbed,
    precision: sass.precision,
    includePaths: sass.includePaths,
    devModule: true
  },
  {
    file: './src/scss/site-es.scss',
    outDir: './dist/styles/',
    outFile: 'site-es.css',
    sourceMapEmbed: sass.sourceMapEmbed,
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/scss/site-ko.scss',
    outDir: './dist/styles/',
    outFile: 'site-ko.css',
    sourceMapEmbed: sass.sourceMapEmbed,
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/scss/site-ur.scss',
    outDir: './dist/styles/',
    outFile: 'site-ur.css',
    sourceMapEmbed: sass.sourceMapEmbed,
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/scss/site-zh-hant.scss',
    outDir: './dist/styles/',
    outFile: 'site-zh-hant.css',
    sourceMapEmbed: sass.sourceMapEmbed,
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/utilities/tailwind/_tailwind.scss',
    outDir: './dist/styles/',
    outFile: 'tailwind.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/utilities/tailwind/_tailwind.scss',
    outDir: './dist/styles/',
    outFile: '_tailwind.scss',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/accordion/_accordion.scss',
    outDir: './dist/components/accordion/',
    outFile: 'accordion.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/alert-box/_alert-box.scss',
    outDir: './dist/components/alert-box/',
    outFile: 'alert-box.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/card/_card.scss',
    outDir: './dist/components/card/',
    outFile: 'card.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/checklist/_checklist.scss',
    outDir: './dist/components/checklist/',
    outFile: 'checklist.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/filter/_filter.scss',
    outDir: './dist/components/filter/',
    outFile: 'filter.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/filter/_filter-multi.scss',
    outDir: './dist/components/filter/',
    outFile: 'filter-multi.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/header/_header.scss',
    outDir: './dist/components/header/',
    outFile: 'header.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/side-nav/_side-nav.scss',
    outDir: './dist/components/side-nav/',
    outFile: 'side-nav.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/share-links/_share-links.scss',
    outDir: './dist/components/share-links/',
    outFile: 'share-links.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/question/_question.scss',
    outDir: './dist/components/question/',
    outFile: 'question.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/share-form/_share-form.scss',
    outDir: './dist/components/share-form/',
    outFile: 'share-form.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/member-list/_member-list.scss',
    outDir: './dist/components/member-list/',
    outFile: 'member-list.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/components/nearby-stops/_nearby-stops.scss',
    outDir: './dist/components/nearby-stops/',
    outFile: 'nearby-stops.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/objects/text-controller/_text-controller.scss',
    outDir: './dist/objects/text-controller/',
    outFile: 'text-controller.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/objects/content/_content.scss',
    outDir: './dist/objects/content/',
    outFile: 'content.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/objects/banner/_banner.scss',
    outDir: './dist/objects/banner/',
    outFile: 'banner.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/objects/alert-banner/_alert-banner.scss',
    outDir: './dist/objects/alert-banner/',
    outFile: 'alert-banner.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/objects/search-box/_search-box.scss',
    outDir: './dist/objects/search-box/',
    outFile: 'search-box.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/objects/footer/_footer.scss',
    outDir: './dist/objects/footer/',
    outFile: 'footer.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/objects/formstack/_formstack.scss',
    outDir: './dist/objects/formstack/',
    outFile: 'formstack.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/objects/navigation/_navigation.scss',
    outDir: './dist/objects/navigation/',
    outFile: 'navigation.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/objects/newsletter/_newsletter.scss',
    outDir: './dist/objects/newsletter/',
    outFile: 'newsletter.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  },
  {
    file: './src/objects/mobile-nav/_mobile-nav.scss',
    outDir: './dist/objects/mobile-nav/',
    outFile: 'mobile-nav.css',
    precision: sass.precision,
    includePaths: sass.includePaths
  }
];

module.exports = modules;