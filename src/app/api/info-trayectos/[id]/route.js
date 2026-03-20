import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const infoTrayecto = await prisma.infoEspecificaTrayecto.findUnique({
            where: { id: +id },
            include: {
                conductor: true,
                trayecto: true,
            },
        });

        if (!infoTrayecto) {
            return NextResponse.json(
                { message: "Info Trayecto not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(infoTrayecto, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
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

        const existing = await prisma.infoEspecificaTrayecto.findUnique({ where: { id: +id } });
        if (!existing) {
            return NextResponse.json(
                { message: "Info Trayecto not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { activo, completado, gasto, conductorDni, trayectoId } = body;

        const data = {};
        if (activo !== undefined) data.activo = activo;
        if (completado !== undefined) data.completado = completado;
        if (gasto !== undefined) data.gasto = gasto;
        if (conductorDni !== undefined) data.conductorDni = conductorDni;
        if (trayectoId !== undefined) data.trayectoId = trayectoId;

        const updated = await prisma.infoEspecificaTrayecto.update({
            where: { id: +id },
            data,
        });

        return NextResponse.json(updated, { status: 200 });
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

        const existing = await prisma.infoEspecificaTrayecto.findUnique({ where: { id: +id } });
        if (!existing) {
            return NextResponse.json(
                { message: "Info Trayecto not found" },
                { status: 404 }
            );
        }

        const deleted = await prisma.infoEspecificaTrayecto.delete({ where: { id: +id } });
        return NextResponse.json(deleted, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
