import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";



export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const trayecto = await prisma.trayecto.findUnique({
            where: { id: +id },
            include: {
                infoEspecifica: true,
                viaje: true,
            },
        });

        if (!trayecto) {
            return NextResponse.json(
                { message: "Trayecto not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(trayecto, { status: 200 });
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

        const existing = await prisma.trayecto.findUnique({ where: { id: +id } });
        if (!existing) {
            return NextResponse.json(
                { message: "Trayecto not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { horaSalida, horaLlegada, origen, destino, distanciaEnKm, viajeId } = body;

        const data = {};
        if (horaSalida !== undefined) data.horaSalida = new Date(horaSalida);
        if (horaLlegada !== undefined) data.horaLlegada = new Date(horaLlegada);
        if (origen !== undefined) data.origen = origen;
        if (destino !== undefined) data.destino = destino;
        if (distanciaEnKm !== undefined) data.distanciaEnKm = distanciaEnKm;
        if (viajeId !== undefined) data.viajeId = viajeId;

        const updated = await prisma.trayecto.update({
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

        const existing = await prisma.trayecto.findUnique({ where: { id: +id } });
        if (!existing) {
            return NextResponse.json(
                { message: "Trayecto not found" },
                { status: 404 }
            );
        }

        const deleted = await prisma.trayecto.delete({ where: { id: +id } });
        return NextResponse.json(deleted, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
