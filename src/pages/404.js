import React, { useMemo } from "react";
import { Link } from "gatsby";

import Layout from "../components/layout";
import SEO from "../components/seo";
import FallingLeafs from "../components/svgs/falling-leafs";

import { useIndexTree } from "../contexts/IndexTreeContext";

// TODO temporary hardcoded but the index data will be calculated in context
// so it is not necessary...
const lang = "en-us";

/**
 * From an array of indexes returns the one for the provided language.
 * If no index is found undefined is returned.
 * @param {string} lang en-us, es-es, it-it, etc...
 */
const getIndexDataByLang = (indexes, lang) => {
  const indexObj = indexes.find(index => index.lang === lang);
  return indexObj && indexObj.items;
};

const NotFoundPage = () => {
  const { indexes } = useIndexTree();

  // TODO another option instead of useMemo is to pass the index already from context,
  // to do that the lang should be passed to context to do the calculation there.
  const indexData = useMemo(() => getIndexDataByLang(indexes, lang), [indexes]);

  console.log(indexData);

  return (
    <Layout>
      <SEO title="Not found" />
      <div className="mx-auto text-center">
        <h1 className="my-14 text-4xl">Nothing found</h1>
        <FallingLeafs rootCssClasses="h-40" />
        <h2 className="mt-14 mb-3 text-3xl">Main topics</h2>
        {indexData ? (
          <ul>
            {indexData.map(item => (
              <li key={item.url}>
                <Link to={item.url}>{item.label}</Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Layout>
  );
};

export default NotFoundPage;
