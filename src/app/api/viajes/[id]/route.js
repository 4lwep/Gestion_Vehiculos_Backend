import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";



export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const viaje = await prisma.viaje.findUnique({
            where: { id: +id },
            include: {
                trayectos: true,
            },
        });

        if (!viaje) {
            return NextResponse.json(
                { message: "Viaje not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(viaje, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}



export async function DELETE(request, { params }) {
    const { id } = await params;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
        return NextResponse.json(
            { error: "Unauthorized. Token expired or invalid." },
            { status: 401 }
        );
    }

    const token = authHeader.split(' ')[1] || authHeader;

    try {
        const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized. Token expired or invalid." },
                { status: 401 }
            );
        }

        const existing = await prisma.viaje.findUnique({ where: { id: +id } });
        if (!existing) {
            return NextResponse.json(
                { message: "Viaje not found" },
                { status: 404 }
            );
        }

        const deleted = await prisma.viaje.delete({
            where: { id: +id },
            include: { trayectos: true },
        });

        return NextResponse.json(deleted, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
