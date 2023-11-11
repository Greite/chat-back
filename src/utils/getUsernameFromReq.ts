export default function getUsernameFromReq(req: Request): string {
  const url = new URL(req.url);
  const username = url.searchParams.get("username");

  if (!username) {
    throw new Error("Username is required");
  }

  return username;
}
