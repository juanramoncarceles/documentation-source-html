# Documentation source html

Created with [Gatsby](https://www.gatsbyjs.com/).

Relevant documentation: [Gatsby node documentation](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/).

---

## Set up

[NodeJS should be installed](https://nodejs.org/).
It has been tested with Node v14.15.5

Once Node is installed, from the project directory run `npm install` to get all the required dependencies.

---

## Gatsby commands

`npm run build` or `gatsby build`: For creating the production build. Final files will be output in the `public` folder.

`npm run develop` or `gatsby develop`: For development. With HMR.

`npm run serve` or `gatsby serve`: For serving the build locally.

`npm run clean` or `gatsby clean`: For deleting the Gatsby cache. **If there are weird errors run this and try again**.

---

## Configuration and structure of the source files

In `gatsby-config.js` set the path to the source folder on the variable `sourceFolder`.

In that same file some site metadata like _title_, _description_ and _author_ can be set.

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

---

## Pages (docs)

The html file names should be the same for all languages to be able to match the translations. Differences in letters' case are ignored (in other words, matching between file names is case insensitive).

The html files hierarchy should be defined in the corresponding `index.xml` file by nesting &lt;topic&gt; elements.

In the `index.xml` by defualt the maximum amount of levels of nested items is 3, but it can be changed in `src > contexts > IndexTreeContext.js` by modifying the GraphQL query.

For each file create a `topic` element which will have a `file` attribute for the **file name without the file extension**, and a `title` attribute for the title of the page in the corresponding language.

All the `topic` elements should be wrapped by a root `Index` element.
That element should have a `title` attribute for the site title in that language, and a `language` attribute with the name of the language.

```xml
<Index title="My Docs site" language="English">
  <topic title="Introduction" file="Intro" />
  <topic title="Get started" file="Get_Started">
    <topic title="A first topic" file="First_Topic" />
    <topic title="A second topic" file="Second_Topic">
      <topic title="A subitem of the second topic" file="Second_Subtopic" />
    </topic>
  </topic>
</Index>
```

Each item in the index is identified by its file name and position in it. This means that a file can appear more than once in the index, but not in the same position (not with the same parents).
A limitation however of adding a file more than once even in different positions is that if there is a link in a page that points to that file, it will go to the first one that appears in the `index.xml`.

It is recomended that the `index.xml` hierarchy remains the same for all the languages.
This makes it possible to keep its collapsement state while changing the language of the site.

Each page/doc has an array of paths (even if most of the time will be just one path), and an array of translation objects with one object for each of the paths.

---

## Search with Algolia

The Algolia credentials should be set in an `.env` file at the root of the project. Copy the `.env.example` file and rename it to use it as a template.

Algolia is used with the [Gatsby plugin Algolia](https://www.gatsbyjs.com/plugins/gatsby-plugin-algolia/).

The data to send to Algolia for indexing is defined in `src > algolia-queries.js` using GraphQL queries.

Data is sent to Algolia at the end of the build process (`npm run build` or `gatsby build`).
If it fails usually it is because the data to send to Algolia is too large.

---

## CSS styles

Styles for the content area of the site are in `src > styles > content-area.css`

Styles for the rest of the layout are with [TailwindCSS](https://tailwindcss.com/docs), so any of its css classes can be applied to the site. Otherwise create your own classes in the `global.css` file.

---

## Other info

Several warnings may appear in the console during development/build indicating HTML files not being used in the `index.xml`.

---

## Known limitations

If a link in an html file points to a section on another html file using a _#_ it will just go to the top of the page, ignoring the hash part of the url.
These seems to be a limitation of the Gatsby's `navigate()` method.
