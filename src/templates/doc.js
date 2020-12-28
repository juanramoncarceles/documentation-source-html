import React, { useEffect } from "react";
import { graphql } from "gatsby";

import Layout from "../components/layout";
import SEO from "../components/seo";
import Index from "../components/index";
import Footer from "../components/footer";
import TableOfContents from "../components/tableOfContents";

import { useIntl } from "../contexts/IntlContext";

const Doc = ({
  data: { landsDesignDoc: doc },
  pageContext: { translations },
}) => {
  const { setLang, setTranslations } = useIntl();
  const lang = doc.lang;
  const { tableOfContents } = doc.childHtmlRehype;

  const pageTitle = doc.fields.title;

  useEffect(() => {
    // TODO Those two methods probably will always be used together so could be "merged"
    setLang(lang);
    setTranslations(translations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, translations]);

  return (
    <Layout>
      <SEO title={pageTitle} />
      <Index lang={lang} cssClasses={"z-40 w-64"} />
      <div className="flex">
        <div className="flex flex-col">
          <div
            id="content"
            dangerouslySetInnerHTML={{ __html: doc.htmlContent }}
            className="p-4 flex-grow"
          />
          <Footer />
        </div>
        <TableOfContents data={tableOfContents} cssClasses={"w-64"} />
      </div>
    </Layout>
  );
};

export const query = graphql`
  query($id: String!) {
    landsDesignDoc(id: { eq: $id }) {
      id
      lang
      htmlContent
      fields {
        title
      }
      childHtmlRehype {
        tableOfContents
      }
    }
  }
`;

export default Doc;
