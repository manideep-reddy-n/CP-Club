import { getCodeChefData } from "@/lib/getCodeChefData";

export async function GET(req, context) {
  const username = context.params.username;

  if (!username) {
    return Response.json({ error: "Username is required" }, { status: 400 });
  }

  const data = await getCodeChefData(username);
  if (!data) {
    return Response.json(
      { error: "User not found or CodeChef blocked request" },
      { status: 500 }
    );
  }

  return Response.json(data);
}
