import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Unauthorized. Token expired or invalid." },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1] || authHeader;

  try {
    const { dni: userDni } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { dni: userDni } });

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Token expired or invalid." },
        { status: 401 },
      );
    }

    if (user.roles[0] != "admin") {
      //Aquí debería ser isAdmin
      return NextResponse.json(
        { error: "No autorizado. No tienes permisos suficientes." },
        { status: 401 },
      );
    }

    const users = await prisma.user.findMany();

    if (!users) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Remove password from the response
    const { password, ...usersWithoutPassword } = users;

    return NextResponse.json(usersWithoutPassword, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
