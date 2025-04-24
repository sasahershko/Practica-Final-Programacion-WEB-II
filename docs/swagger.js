require("dotenv").config()
const swaggerJsdoc = require("swagger-jsdoc")
const port = process.env.PORT || 5000

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Tracks - Express API with Swagger (OpenAPI 3.0)",
            version: "0.1.0",
            description:
                "This is a CRUD API application made with Express and documented with Swagger",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
            contact: {
                name: "u-tad",
                url: "https://u-tad.com",
                email: "sasas@u-tad.com",
            },
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer"
                },
            },
            schemas:{
                ClientInput: {
                    type: "object",
                    required: ["name", "cif"],
                    properties: {
                        name: { type: "string", example: "Empresa S.A." },
                        cif: { type: "string", example: "B12345678" },
                        address: {
                            type: "object",
                            properties: {
                                street: { type: "string", example: "Calle Falsa 123" },
                                number: { type: "integer", example: 10 },
                                postal: { type: "integer", example: 28080 },
                                city: { type: "string", example: "Madrid" },
                                province: { type: "string", example: "Madrid" }
                            }
                        }
                    }
                },
                Client: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "661ebc5dc8b4f823cdcf4aa7" },
                        name: { type: "string", example: "Empresa S.A." },
                        logo: { type: "string", example: "" },
                        activeProjects: { type: "integer", example: 2 },
                        pendingDeliveryNotes: { type: "integer", example: 1 },
                        address: {
                            type: "object",
                            properties: {
                                street: { type: "string", example: "Calle Falsa 123" },
                                number: { type: "integer", example: 10 },
                                postal: { type: "integer", example: 28080 },
                                city: { type: "string", example: "Madrid" },
                                province: { type: "string", example: "Madrid" },
                                cif: { type: "string", example: "B12345678" }
                            }
                        },
                        userId: { type: "string", example: "661e88f5c8b4f823cdcf4a2b" },
                        deleted: { type: "boolean", example: false },
                        createdAt: { type: "string", format: "date-time", example: "2024-01-01T00:00:00.000Z" },
                        updatedAt: { type: "string", format: "date-time", example: "2024-01-02T00:00:00.000Z" }
                    }
                },
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "661ebc5dc8b4f823cdcf4aa7" },
                        name: { type: "string", example: "Sasa" },
                        surnames: { type: "string", example: "Lara" },
                        nif: { type: "string", example: "12345678Z" },
                        email: { type: "string", example: "sasa@empresa.com" },
                        role: { type: "string", enum: ["admin", "user", "guest"], example: "user" },
                        verified: { type: "boolean", example: true },
                        active: { type: "boolean", example: true },
                        company: {
                            type: "object",
                            properties: {
                                name: { type: "string", example: "U-tad" },
                                cif: { type: "string", example: "B12345678" },
                                street: { type: "string", example: "Av. Universidad" },
                                number: { type: "integer", example: 12 },
                                postal: { type: "integer", example: 28223 },
                                city: { type: "string", example: "Madrid" },
                                province: { type: "string", example: "Madrid" }
                            }
                        },
                        logo: { type: "string", example: "https://gateway.pinata.cloud/ipfs/QmLogoHash" },
                        createdAt: { type: "string", format: "date-time", example: "2024-01-01T00:00:00.000Z" },
                        updatedAt: { type: "string", format: "date-time", example: "2024-01-10T00:00:00.000Z" }
                    }
                },
                DeliveryNote: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "661ebc5dc8b4f823cdcf4aa9" },
                        userId: { type: "string", example: "661e88f5c8b4f823cdcf4a2b" },
                        clientId: {
                            type: "object",
                            properties: {
                                _id: { type: "string", example: "661ebc5dc8b4f823cdcf4aa1" },
                                name: { type: "string", example: "SasaCorp" },
                                cif: { type: "string", example: "B12345678" }
                            }
                        },
                        projectId: {
                            type: "object",
                            properties: {
                                _id: { type: "string", example: "661ebc5dc8b4f823cdcf4aa2" },
                                name: { type: "string", example: "Instalación red" },
                                code: { type: "string", example: "PROJ001" }
                            }
                        },
                        name: { type: "string", example: "Instalación inicial" },
                        date: { type: "string", format: "date", example: "2024-04-20T10:00:00.000Z" },
                        description: { type: "string", example: "Montaje completo de red" },
                        format: {
                            type: "string",
                            enum: ["hours", "materials", "both"],
                            example: "hours"
                        },
                        hours: { type: "number", example: 6 },
                        workers: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string", example: "Juan Pérez" },
                                    hours: { type: "number", example: 3 }
                                }
                            }
                        },
                        materials: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string", example: "Cable UTP" },
                                    quantity: { type: "number", example: 20 },
                                    unit: { type: "string", example: "metros" }
                                }
                            }
                        },
                        sign: {
                            type: "string",
                            example: "https://gateway.pinata.cloud/ipfs/QmSignatureHash"
                        },
                        pdfUrl: {
                            type: "string",
                            example: "https://gateway.pinata.cloud/ipfs/QmPDFHash"
                        },
                        pending: { type: "boolean", example: false },
                        archived: { type: "boolean", example: false },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2024-04-20T10:00:00.000Z"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2024-04-20T10:05:00.000Z"
                        }
                    }
                },
                Project: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "66201b8a58b5d341ddca8e25"
                        },
                        userId: {
                            type: "string",
                            example: "661e88f5c8b4f823cdcf4a2b"
                        },
                        clientId: {
                            type: "string",
                            example: "661ebc5dc8b4f823cdcf4aa1"
                        },
                        name: {
                            type: "string",
                            example: "Reforma Local Madrid"
                        },
                        projectCode: {
                            type: "string",
                            example: "REFORM-MAD-01"
                        },
                        code: {
                            type: "string",
                            example: "2301-RM"
                        },
                        address: {
                            type: "object",
                            properties: {
                                street: { type: "string", example: "Calle Mayor" },
                                number: { type: "integer", example: 15 },
                                postal: { type: "integer", example: 28080 },
                                city: { type: "string", example: "Madrid" },
                                province: { type: "string", example: "Madrid" }
                            }
                        },
                        begin: {
                            type: "string",
                            example: "2024-05-01"
                        },
                        end: {
                            type: "string",
                            example: "2024-08-01"
                        },
                        notes: {
                            type: "string",
                            example: "Proyecto urgente por apertura del local en septiembre"
                        },
                        servicePrices: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    serviceName: { type: "string", example: "Electricidad" },
                                    unitPrice: { type: "number", example: 45 }
                                }
                            }
                        },
                        archived: {
                            type: "boolean",
                            example: false
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2024-04-20T10:00:00.000Z"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2024-04-21T12:00:00.000Z"
                        }
                    }
                }
                //* siguiente
            },
        },
    },
    apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options)