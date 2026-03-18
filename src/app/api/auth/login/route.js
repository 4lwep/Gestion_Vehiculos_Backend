import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";



export async function POST(request) {
    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json(
            { error: "Missing email or password" },
            { status: 400 }
        )
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        )
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        return NextResponse.json(
            { error: "Invalid password" },
            { status: 401 }
        )
    }

    const { id, fullName, isActive, roles } = user;

    // FIRMAMOS TOKEN
    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "2h" });

    return NextResponse.json(
        { id, email, fullName, isActive, roles, token },
        { status: 201, statusText: "Login successful" }
    )
}