export function checker(
  hash: string, encodingPattern: RegExp, hashToMatch: string,
  algorithmToMatch = 'sha1', lengthToMatch = 0,
): boolean {
  const members = /^([a-zA-Z0-9-]*)-([\s\S]*)/.exec(hash);
  if (!members || !members.length) {
    return false;
  }
  const matchAlgorithm = members[1] === algorithmToMatch;
  const matchEncoding = encodingPattern.test(members[2]) && members[2] === hashToMatch;
  const matchLength = lengthToMatch > 1 ? members[2].length === lengthToMatch : true;
  return matchAlgorithm && matchEncoding && matchLength;
}
