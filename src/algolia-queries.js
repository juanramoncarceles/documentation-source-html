/*
 * Here the Algolia queries are created.
 * With the queries I indicate which content should be indexed by Algolia.
 * Since this is a multilingual site there are two strategies:
 * https://www.algolia.com/doc/guides/managing-results/optimize-search-results/handling-natural-languages-nlp/how-to/multilingual-search/
 * Currently I implemented the one with a single Algolia index where each record contains all the languages.
 *
 * The other option would be to implement a different Algolia index per language.
 * So 'Docs_en-us' would contain the english records, 'Docs_es-es' the spanish records, etc.
 * Maybe this could be done adding the different indexes to the queries array below, otherwise check this example:
 * https://github.com/algolia/gatsby-plugin-algolia/issues/8#issuecomment-427657349
 * Then when searching from frontend select the index to use based on the current language of the site.
 */

/*
 // The query with 'lang' variable for the case of a different Algolia index per lang.
  const docQuery = `{
    docs: allLandsDesignDoc(filter: { lang: { eq: "${lang}" } }) {
      edges {
        node {
          id
          paths
          title
          # htmlContent
        }
      }
    }
  }`;
*/

const docQuery = `{
  docs: allLandsDesignDoc {
    group(field: file) {
      nodes {
        id
        paths
        lang
        title
        # htmlContent
      }
    }
  }
}`;

/**
 * Returns an Algolia record.
 * The id used for the record object is the one from the english version of the doc.
 * @param {Object} object object with a field 'nodes' with an array of objects {id, paths, lang, title}.
 * @returns {Object} With objectID and a title_<lang> and path_<lang> field for each lang.
 */
function createAlgoliaRecord({ nodes }) {
  let record = {};
  nodes.forEach(n => {
    if (n.lang === "en-us") record.objectID = n.id;
    record[`title_${n.lang}`] = n.title;
    record[`paths_${n.lang}`] = n.paths;
  });
  return record;
}

const queries = [
  {
    query: docQuery,
    transformer: ({ data }) => data.docs.group.map(createAlgoliaRecord),
    indexName: "Docs",
    settings: {
      // if searchableAttributes could be dynamic [...data.docs.group[0].nodes.map(n => `title_${n.lang}`)]
      searchableAttributes: [
        "title_en-us",
        "title_es-es",
        "title_it-it",
        "title_de-de",
        "title_fr-fr",
      ],
      //attributesToSnippet: [`htmlContent:20`],
    },
  },
];

module.exports = queries;
