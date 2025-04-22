export async function GET() {
  const appUrl = `https://dir.coordinape.com`;

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjM2NjgxMCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDU2QTlEOWUwYkVCREQ1ZjlFNjBiY0Y1NjM5NzU0NTYyYzI2MEJFRkMifQ",
      payload: "eyJkb21haW4iOiJkaXIuY29vcmRpbmFwZS5jb20ifQ",
      signature:
        "MHg3OTkxMDRiZDQ5ODYyZTUxMWZmMTdmZTQxYzBhYmY4OGNkY2JlYjY3NzM4MDZkN2VhY2UzMDI2ZTljOWIxNjQzMzFkNmMxMjYwMWZiMTg4NDA2YTczOTJmNjU0MGFlZjRhMDkyMThkNTI0MjM2MjY2Y2U1NDYxNDNmMWEwN2QxNjFj",
    },
    frame: {
      version: "1",
      name: "Creators Directory",
      iconUrl: `${appUrl}/favicon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/ogimage?title=Creators+Directory`,
      buttonTitle: "Launch Frame",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#0053ff",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
