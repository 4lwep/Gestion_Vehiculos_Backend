import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";



export async function POST(request) {

    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        );
    }

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: bcrypt.hashSync(password),
                fullName
            }
        });
        const { id, isActive, roles } = user;

        return NextResponse.json(
            { id, email, fullName, isActive, roles },
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