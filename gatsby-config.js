module.exports = {
  siteMetadata: {
    title: `Lands Design help`,
    description: `Lands Design is a plugin for landscape design for Rhino and AutoCAD. Lands Design provides tools for producing 2D drawings and 3D models of any landscape project.`,
    author: `Asuni Soft`,
    defaultLang: "en-us", // If set, the locale will be hidden from the url. To unset leave as empty string.
  },
  flags: {
    PRESERVE_WEBPACK_CACHE: true,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `docImages`,
        path: `${__dirname}/contents`,
        ignore: [`**/*.html`, `**/*.xml`],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Lands Design Help`,
        short_name: `LD Help`,
        start_url: `/`,
        background_color: `#70b570`,
        theme_color: `#70b570`,
        display: `minimal-ui`,
        icon: `src/images/lands-icon.png`, // This path is relative to the root of the site.
      },
    },
    `gatsby-transformer-xml`,
    {
      resolve: `gatsby-transformer-rehype`,
      options: {
        filter: node => node.internal.type === `LandsDesignDoc`,
        source: node => node.htmlContent, // Where the HTML is located in the LandsDesignDoc node.
        fragment: true,
        space: `html`,
        emitParseErrors: false,
        verbose: false,
        plugins: [],
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "doc",
        path: `${__dirname}/contents`,
        //ignore: [`**/*.jpg`, `**/*.png`, `**/*.gif`, `**/*.xml`],
      },
    },
    `gatsby-plugin-postcss`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
};
