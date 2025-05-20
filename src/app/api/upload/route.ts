export async function POST(req: Request) {
  const chunk = await req.text()
  console.log(chunk)

  return Response.json({message: 'Chunk recived'})
}
