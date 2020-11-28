exports.slugify = (text) => {
  return text
    .toString()
    .normalize('NFD')                // Split an accented letter in the base letter and the accent.
    .replace(/[\u0300-\u036f]/g, '') // Remove all previously split accents.
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-'); 
};
