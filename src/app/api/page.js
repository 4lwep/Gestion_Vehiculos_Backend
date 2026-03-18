'use client'

import { useEffect, useRef } from "react";
import SwaggerUI from "swagger-ui-dist/swagger-ui-es-bundle";
import "swagger-ui-dist/swagger-ui.css";


export default function page() {
    return (
        <div>
            <div className="p-20 grid place-content-center bg-blue-700 text-white text-4xl">
                API Doc
            </div>
            <SwaggerDocs />
        </div>
    );
}




function SwaggerDocs() {
    const uiRef = useRef(null);

    useEffect(() => {
        SwaggerUI({
            url: "/openapi.yaml", // Especificación en archivo /public/openapi.yaml
            domNode: uiRef.current,
            layout: "BaseLayout"
        });
    }, []);

    return <div ref={uiRef} />;
}