import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { dni } = await params;

    try {
        const user = await prisma.user.findUnique({
            where: { dni },
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Remove password from the response
        const { password, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword, { status: 200 });
    } catch (error) {
        console.error("Error fetching user by DNI:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
