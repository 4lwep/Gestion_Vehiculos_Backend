import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";



export async function POST(request) {
    const { dni, password } = await request.json();

    if (!dni || !password) {
        return NextResponse.json(
            { error: "Missing DNI or password" },
            { status: 400 }
        )
    }

    const user = await prisma.user.findUnique({ where: { dni } });

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

    const { fullName, isActive, roles, email } = user;

    // FIRMAMOS TOKEN
    const token = jwt.sign({ dni }, process.env.JWT_SECRET, { expiresIn: "2h" });

    return NextResponse.json(
        { dni, email, fullName, isActive, roles, token },
        { status: 201, statusText: "Login successful" }
    )
}