import React, { useEffect } from "react";
import { Link } from "gatsby";

import Layout from "../components/layout";
import SEO from "../components/seo";
import FallingLeafs from "../components/svgs/falling-leafs";

import { useIndexTree } from "../contexts/IndexTreeContext";
import { useIntl } from "../contexts/IntlContext";

const NotFoundPage = () => {
  const { index } = useIndexTree();
  const { defaultLang, setLang } = useIntl();

  // Since this page has no lang, use the lang in localStorage or the defaultLang.
  useEffect(() => {
    const storedLang = localStorage.getItem("lang");
    setLang(storedLang ?? defaultLang);
  }, [defaultLang, setLang]);

  return (
    <Layout>
      <SEO title="Not found" />
      <div className="mx-auto text-center">
        <h1 className="my-14 text-4xl">Nothing found</h1>
        <FallingLeafs rootCssClasses="h-40" />
        {index ? (
          <>
            <h2 className="mt-14 mb-3 text-3xl">Main topics</h2>
            <ul>
              {index.map(item => (
                <li key={item.url}>
                  <Link to={item.url}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </Layout>
  );
};

export default NotFoundPage;
