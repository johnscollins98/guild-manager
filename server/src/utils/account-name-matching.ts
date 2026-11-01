const discordNameCharacters = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;

export const matchesAccountName = (
  candidateName: string | undefined,
  gw2AccountName: string
): boolean => {
  if (!candidateName) return false;

  const accountStem = gw2AccountName.split('.')[0]!;
  const normalizedName = candidateName.normalize('NFKC').replace(discordNameCharacters, '');
  const escapedAccountStem = accountStem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matcher = new RegExp(`(?:^|[^a-z])(${escapedAccountStem})(?:$|[^a-z])`, 'i');

  return matcher.test(normalizedName);
};