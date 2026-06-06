/**
 * Generates the thumbnail URL from a full profile picture URL.
 * Suffixes the filename with '_thumb' before the extension.
 */
export function getProfilePictureThumbnail(url: string | null | undefined): string | undefined {
  if (!url) return undefined

  const lastDotIndex = url.lastIndexOf('.')
  if (lastDotIndex === -1) return url

  const filename = url.substring(0, lastDotIndex)
  const extension = url.substring(lastDotIndex)

  return `${filename}_thumb${extension}`
}
