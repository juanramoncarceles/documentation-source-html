# Documentation source html

Created with [Gatsby](https://www.gatsbyjs.com/).

- [Gatsby node documentation](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/).

## Set up

[NodeJS should be installed](https://nodejs.org/).
It has been tested with Node v14.15.5

Once Node is installed, from the project directory run:
`npm install`

## Gatsby commands

`npm run build` or `gatsby build`: For creating the production build. Final files will be output in the `public` folder.

`npm run develop` or `gatsby develop`: For development. With HMR.

`npm run serve` or `gatsby serve`: For serving the build locally.

`npm run clean` or `gatsby clean`: For deleting the Gatsby cache. **If there are weird errors run this and try again**.

## Configuration and structure of the source files

In `gatsby-config.js` set the path to the source folder with the variable `sourceFolder`.

In that same file some site metadata like title, description and author can be set.

In the source folder there should be a folder for each language version.
The name of each folder should be the desired language locale.
Also there may be a folder called `common` with a folder `images` for the common images.
Inside each language folder there should be:

- A folder named `html` for all the html source files for that language.
- A folder named `images` for the images specific to that version.
- An xml file named `index.xml` with the html files' hierarchy for that language.

Example with a source folder named `docs` and only one locale folder for English:

```
docs
  ├── common
  │     └── images
  │            └── example-image.jpg
  └── en-us
        ├── html
        │    └── example-source.html
        ├── images
        │     └── example-image.jpg
        └── index.xml
```

It is possible to create subfolders inside the images folders to organize them.

Paths used in the html source files, like in images and anchors, should reflect that folder structure.

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

Styles for the content area of the site are in `src > styles > content-area.css`

Styles for the rest of the layout are with [TailwindCSS](https://tailwindcss.com/docs), so any of its css classes can be applied to the site. Otherwise create your own classes in the `global.css` file.
