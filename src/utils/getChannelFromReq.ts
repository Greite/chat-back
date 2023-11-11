export default function getChannelFromReq(req: Request): number {
  const url = new URL(req.url);
  const channel = url.searchParams.get("channel");

  if (!channel) {
    throw new Error("Channel is required");
  }

  return parseInt(channel, 10);
}
