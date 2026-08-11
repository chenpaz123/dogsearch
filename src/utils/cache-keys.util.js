const SHOWS_CACHE_KEY = Object.freeze(["firestore", "shows:list"]);

const showDogCacheKey = (showName, chipNumber) => [
  "firestore",
  "show-dog",
  String(showName),
  String(chipNumber),
];

module.exports = {
  SHOWS_CACHE_KEY,
  showDogCacheKey,
};
