import React from "react";
import { graphql, Link } from "gatsby";

import Layout from "../components/layout";
import SEO from "../components/seo";

const Doc = ({ data: { landsDesignDoc: doc } }) => {
  return (
    <Layout>
      <SEO title={doc.name} />
      <div dangerouslySetInnerHTML={{ __html: doc.htmlContent }} />
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
