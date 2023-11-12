export default function getUserIdFromReq(req: Request): string {
  const url = new URL(req.url)
  const userId = url.searchParams.get('id')

  if (!userId) {
    throw new Error('ID is required')
  }

  return userId
}
