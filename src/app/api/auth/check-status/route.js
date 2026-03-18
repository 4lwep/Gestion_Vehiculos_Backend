import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function GET(request) {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const token = authHeader.split(' ')[1] || authHeader;

    try {
        // VERIFICAMOS TOKEN
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        const { email, fullName, isActive, roles } = user;
        return NextResponse.json(
            { id, email, fullName, isActive, roles, token },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            { error: "Invalid token" },
            { status: 401 }
        )
    }
}