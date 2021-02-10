exports.slugify = text => {
  return text
    .toString()
    .normalize("NFD") // Split an accented letter in the base letter and the accent.
    .replace(/[\u0300-\u036f]/g, "") // Remove all previously split accents.
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

/**
 * Replaces image's src values to point the final path for the image file.
 * If the image's new src can't be found an info message is logged and
 * the original src is left.
 * @param {string} stringHTML Input HTML as a string.
 * @param {Object[]} imagesData An array of objects with 'relativePath' and 'src' values.
 * @param {string} lang The lang code of the file.
 * @param {string} fileName The name of the HTML file being processed.
 */
exports.replaceHTMLImagesSrc = (stringHTML, imagesData, lang, fileName) => {
  // Regexp to match the src attr of image HTML elements.
  const imgSrcRegex = /<\s*img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/gi;

  return stringHTML.replace(imgSrcRegex, (match, p1) => {
    const lowerCaseSrc = p1.trim().toLowerCase();
    if (lowerCaseSrc.startsWith("../images/")) {
      const pathWithLang = lowerCaseSrc.replace("../", lang + "/");
      const imageData = imagesData.find(
        image => image.relativePath === pathWithLang
      );
      if (imageData) {
        return match.replace(p1, imageData.src);
      } else {
        // If here means that the image is not language specific and could be in the common folder.
        const pathWithCommon = lowerCaseSrc.replace("../", "common/");
        const imageData = imagesData.find(
          image => image.relativePath === pathWithCommon
        );
        if (imageData) {
          return match.replace(p1, imageData.src);
        } else {
          console.log(
            `[HTML image src] No src replaced for "${p1}" in ${lang} - ${fileName}`
          );
          return match;
        }
      }
    } else {
      console.log(
        `[HTML image src] Skipped image with src: ${p1} in ${lang} - ${fileName}`
      );
      return match;
    }
  });
};

/**
 * Replaces anchor's href values that point to HTML files in the same folder.
 * The new href value is a relative path (without the web origin part).
 * If the href value contains a page anchor at the end it will be preserved.
 * If the anchor points to the same page only the anchor will be left.
 * @param {string} stringHTML Input HTML as a string.
 * @param {Object[]} pathObjsArray An array of objects with at least 'path' and 'file' values.
 * @param {string} lang The lang code of the file.
 * @param {string} defaultLang The default lang code set for the site.
 * @param {string} fileName The name of the HTML file being processed.
 */
exports.replaceHTMLAnchorsHref = (
  stringHTML,
  pathObjsArray,
  lang,
  defaultLang,
  fileName
) => {
  // Regexp to match the href attr of anchor HTML elements.
  const anchorHrefRegex = /<\s*a\s[^>]*?href\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/gi;

  return stringHTML.replace(anchorHrefRegex, (match, p1) => {
    const trimmedHref = p1.trim();
    // If starts with https:// http:// or www. then skip it.
    const isExternalHref =
      /^https?:\/\//.test(trimmedHref) || trimmedHref.startsWith("www.");
    if (!isExternalHref) {
      // If contains a '/' then skip because we are only treating same directory files.
      if (!trimmedHref.includes("/")) {
        const hrefFileNameAndAnchor = trimmedHref.split("#");
        const hrefFileName = hrefFileNameAndAnchor[0]
          .toLowerCase()
          .replace(".html", "");
        const pageAnchor =
          hrefFileNameAndAnchor.length > 1
            ? `#${hrefFileNameAndAnchor[1]}`
            : "";
        // If the link is an anchor in the same page only the anchor is left.
        if (pageAnchor && hrefFileName === fileName.toLowerCase()) {
          return match.replace(p1, pageAnchor);
        } else {
          const pathObj = pathObjsArray.find(
            pathObj => pathObj.file.toLowerCase() === hrefFileName
          );
          if (pathObj) {
            const newHref =
              "/" +
              (defaultLang !== lang ? lang + "/" : "") +
              pathObj.path +
              pageAnchor;
            return match.replace(p1, newHref);
          } else {
            console.log(
              `[HTML anchors replacement] No path object found for "${hrefFileName}"${
                fileName ? ` in ${lang} - ${fileName}.` : "."
              }`
            );
            return match; // TODO if the file doesn't exist then the anchor should be removed.
          }
        }
      } else {
        console.log(
          `[HTML anchors replacement] Skipped "${trimmedHref}"${
            fileName ? ` in ${lang} - ${fileName}.` : "."
          } It has a '/' and only same directoy files are processed.`
        );
        return match; // TODO if the file doesn't exist then the anchor should be removed.
      }
    } else {
      return match;
    }
  });
};
