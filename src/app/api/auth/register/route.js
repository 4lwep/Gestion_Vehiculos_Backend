import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";



export async function POST(request) {

    const { email, password, fullName, dni, telefono } = await request.json();

    if (!email || !password || !fullName || !dni || !telefono) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        );
    }

    try {
        const user = await prisma.user.create({
            data: {
                dni,
                email,
                password: bcrypt.hashSync(password),
                fullName,
                telefono
            }
        });
        const { isActive, roles } = user;

        return NextResponse.json(
            { dni, email, fullName, telefono, isActive, roles },
            { status: 201 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: 'User already exists' },
            { status: 409 }
        );
    }
}