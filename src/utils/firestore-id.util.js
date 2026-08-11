/**
 * Guards against using untrusted input as a Firestore document ID.
 *
 * A "/" inside a doc ID is not escaped by the Admin SDK's `.doc()` call -
 * it's treated as a path separator. Depending on how many segments the
 * caller sneaks in, that can retarget the write to an arbitrary
 * collection/document instead of the one the code intended (path
 * traversal / NoSQL injection via document path). "." and ".." are also
 * rejected outright by Firestore, but we validate them here too so callers
 * get a clean 400 instead of an SDK-level exception.
 */
const isValidFirestoreDocId = (id) => {
  if (id === null || id === undefined) {
    return false;
  }
  if (typeof id !== "string" && typeof id !== "number") {
    return false;
  }

  const value = String(id);
  if (value.length === 0 || value.length > 1500) {
    return false;
  }
  if (value.includes("/")) {
    return false;
  }
  if (value === "." || value === "..") {
    return false;
  }

  return true;
};

module.exports = { isValidFirestoreDocId };
