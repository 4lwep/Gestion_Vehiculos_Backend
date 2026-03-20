import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const averia = await prisma.averia.findUnique({
            where: { id: +id },
            include: {
                vehiculosAveriados: true,
            },
        });

        if (!averia) {
            return NextResponse.json(
                { message: "Avería not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(averia, { status: 200 });
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

        const existing = await prisma.averia.findUnique({ where: { id: +id } });
        if (!existing) {
            return NextResponse.json(
                { message: "Avería not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const {
            descripcion, fechaAveria, fechaComienzoReparacion,
            fechaFinReparacion, lugarReparacion, costeReparacion
        } = body;

        const data = {};
        if (descripcion !== undefined) data.descripcion = descripcion;
        if (fechaAveria !== undefined) data.fechaAveria = new Date(fechaAveria);
        if (fechaComienzoReparacion !== undefined) data.fechaComienzoReparacion = new Date(fechaComienzoReparacion);
        if (fechaFinReparacion !== undefined) data.fechaFinReparacion = new Date(fechaFinReparacion);
        if (lugarReparacion !== undefined) data.lugarReparacion = lugarReparacion;
        if (costeReparacion !== undefined) data.costeReparacion = costeReparacion;

        const updated = await prisma.averia.update({
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

        const existing = await prisma.averia.findUnique({ where: { id: +id } });
        if (!existing) {
            return NextResponse.json(
                { message: "Avería not found" },
                { status: 404 }
            );
        }

        const deleted = await prisma.averia.delete({ where: { id: +id } });
        return NextResponse.json(deleted, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
