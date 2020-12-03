import React from "react";
import { graphql, Link } from "gatsby";

import Layout from "../components/layout";
import SEO from "../components/seo";
import Index from "../components/index";

const Doc = ({
  data: { landsDesignDoc: doc },
  pageContext: { translations },
}) => {
  return (
    <Layout>
      <SEO title={doc.name} />
      <Index lang={"es-es"} />
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
