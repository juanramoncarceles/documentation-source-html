import React, { useState, useEffect } from "react";
import { graphql } from "gatsby";

import Layout from "../components/layout";
import SEO from "../components/seo";
import ToggleNavButton from "../components/toggle-nav-button";
import Index from "../components/index";
import Footer from "../components/footer";

import { useIntl } from "../contexts/IntlContext";

const Doc = ({ data: { landsDesignDoc: doc }, path }) => {
  const [navIsOpen, setNavIsOpen] = useState(false);
  const { setLang, setTranslations } = useIntl();
  const lang = doc.lang;

  const pageTitle = doc.title;

  const translations = doc.translations.find(t => t[doc.lang] === path) ?? {};

  useEffect(() => {
    if (navIsOpen) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }
  }, [navIsOpen]);

  useEffect(() => {
    // TODO Those two methods probably will always be used together so could be "merged"
    setLang(lang);
    setTranslations(translations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, translations]);

  return (
    <Layout>
      <SEO title={pageTitle} />
      <ToggleNavButton open={navIsOpen} setOpen={setNavIsOpen} />
      <Index
        lang={lang}
        setOpen={setNavIsOpen}
        cssClasses={`fixed min-w-64 inset-0 top-20 w-full z-40 lg:static lg:w-auto lg:block ${
          navIsOpen ? "" : "hidden"
        }`}
      />
      <div className="flex flex-col w-full min-h-(screen-20)">
        <div
          id="content"
          dangerouslySetInnerHTML={{ __html: doc.htmlContent }}
          className="px-4 sm:px-8 py-10 flex-grow break-words"
        />
        <Footer />
      </div>
    </Layout>
  );
};

export const query = graphql`
  query($id: String!) {
    landsDesignDoc(id: { eq: $id }) {
      id
      lang
      title
      translations
      htmlContent
    }
  }
`;

export default Doc;
