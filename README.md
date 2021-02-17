# Documentation source html

Created with [Gatsby](https://www.gatsbyjs.com/).

- [Gatsby node documentation](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/).

## Set up

[NodeJS should be installed](https://nodejs.org/).
It has been tested with v14.15.1

Once Node is installed, from the project directory run:
`npm install`

## Gatsby commands

`gatsby build` For creating the production build. Final files will be output in the `public` folder.

`gatsby develop` For development. With HMR.

`gatsby serve` For serving the build locally.

`gatsby clean` For deleting the Gatsby cache. If there are weird errors run this and try again.

## Configuration

In `gatsby-config.js` define the path `sourceFolder` to the source files and the site metadata.

## Index tree nested levels

By defualt the maximum is 3 levels, but it can be changed in `src > contexts > IndexTreeContext.js`.

## Pages

Pages can be duplicated by adding them more than once to the `index.xml`. However if there is a link in a page that points to a duplicated page it will point to the first one that appears in the `index.xml`.

The `file` attribute in the `topic` elements in the `index.xml` files should be the same in all languages. This is because translations use the file name and position in the `index.xml` to identify the corresponding versions of the same file. Comparisons of file names are case insensitive however.

## Search with Algolia

Data is sent to Algolia at the end of the build process (`gatsby build`).
If it fails usually it is because data is to large.

#### Configuration

Copy the `.env.example` file, rename it to `.env` and fill the data.

## Other info

Several warnings may appear in the console during development/build indicating HTML files not being used in the `index.xml`.
