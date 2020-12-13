import React, { useContext, useEffect } from "react";
import { graphql, Link } from "gatsby";

import Layout from "../components/layout";
import SEO from "../components/seo";
import Index from "../components/index";

import { IntlContext } from "../contexts/IntlContext";

const Doc = ({
  data: { landsDesignDoc: doc },
  pageContext: { translations },
}) => {
  const { setLang, setTranslations } = useContext(IntlContext);
  const lang = doc.lang;

  useEffect(() => {
    // TODO Those two methods probably will always be used together so could be "merged"
    setLang(lang);
    setTranslations(translations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, translations]);

  return (
    <Layout>
      <SEO title={doc.name} />
      <Index lang={lang} />
      <div
        dangerouslySetInnerHTML={{ __html: doc.htmlContent }}
        className="p-4"
      />
    </Layout>
  );
};

export const query = graphql`
  query($id: String!) {
    landsDesignDoc(id: { eq: $id }) {
      id
      name
      lang
      htmlContent
    }
  }
`;

export default Doc;
