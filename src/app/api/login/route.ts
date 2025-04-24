import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { id, password } = body;

  const validId = process.env.USERID;
  const validPassword = process.env.PASSWORD;

  if (id === validId && password === validPassword) {
    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Set-Cookie": `auth=true; Path=/; HttpOnly; SameSite=Strict`,
        "Content-Type": "application/json",
      },
    });
    return response;
  } else {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }
}
