import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";



export async function GET(request, { params }) {
    const { dni } = await params;

    try {
        const conductor = await prisma.conductor.findUnique({
            where: { dni },
            include: {
                vehiculo: true,
                infoEspecificaTrayectos: true,
            },
        });

        if (!conductor) {
            return NextResponse.json(
                { message: "Conductor not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(conductor, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}



export async function PATCH(request, { params }) {
    const { dni } = await params;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
        return NextResponse.json(
            { error: "Unauthorized. Token expired or invalid." },
            { status: 401 }
        );
    }

    const token = authHeader.split(' ')[1] || authHeader;

    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized. Token expired or invalid." },
                { status: 401 }
            );
        }

        const existing = await prisma.conductor.findUnique({ where: { dni } });
        if (!existing) {
            return NextResponse.json(
                { message: "Conductor not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { nombre, apellidos, telefono, direccion, fechaNacimiento } = body;

        const data = {};
        if (nombre !== undefined) data.nombre = nombre;
        if (apellidos !== undefined) data.apellidos = apellidos;
        if (telefono !== undefined) data.telefono = telefono;
        if (direccion !== undefined) data.direccion = direccion;
        if (fechaNacimiento !== undefined) data.fechaNacimiento = new Date(fechaNacimiento);

        const updatedConductor = await prisma.conductor.update({
            where: { dni },
            data,
        });

        return NextResponse.json(updatedConductor, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}



export async function DELETE(request, { params }) {
    const { dni } = await params;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
        return NextResponse.json(
            { error: "Unauthorized. Token expired or invalid." },
            { status: 401 }
        );
    }

    const token = authHeader.split(' ')[1] || authHeader;

    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized. Token expired or invalid." },
                { status: 401 }
            );
        }

        const existing = await prisma.conductor.findUnique({ where: { dni } });
        if (!existing) {
            return NextResponse.json(
                { message: "Conductor not found" },
                { status: 404 }
            );
        }

        const deleted = await prisma.conductor.delete({ where: { dni } });
        return NextResponse.json(deleted, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
