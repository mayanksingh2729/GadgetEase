const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GadgetEase API",
      version: "1.0.0",
      description: "API documentation for the GadgetEase gadget rental platform",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["user", "admin"] },
            avatarUrl: { type: "string" },
            addresses: { type: "array", items: { $ref: "#/components/schemas/Address" } },
          },
        },
        Address: {
          type: "object",
          properties: {
            fullName: { type: "string" },
            phone: { type: "string" },
            addressLine1: { type: "string" },
            addressLine2: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            pincode: { type: "string" },
          },
        },
        Product: {
          type: "object",
          properties: {
            _id: { type: "string" },
            id: { type: "string" },
            name: { type: "string" },
            brand: { type: "string" },
            category: { type: "string" },
            price: { type: "number", description: "Daily rental price" },
            week: { type: "number", description: "Weekly rental price" },
            month: { type: "number", description: "Monthly rental price" },
            security: { type: "number", description: "Security deposit" },
            images: { type: "array", items: { type: "string" } },
            description: { type: "string" },
          },
        },
        CartItem: {
          type: "object",
          properties: {
            productId: { type: "string" },
            name: { type: "string" },
            image: { type: "string" },
            brand: { type: "string" },
            price: { type: "number" },
            quantity: { type: "number" },
            duration: { type: "string", enum: ["day", "week", "month"] },
            security: { type: "number" },
            totalPrice: { type: "number" },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            items: { type: "array", items: { $ref: "#/components/schemas/CartItem" } },
            shippingAddress: { $ref: "#/components/schemas/Address" },
            totalAmount: { type: "number" },
            status: { type: "string", enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"] },
            paymentStatus: { type: "string", enum: ["pending", "paid", "failed"] },
            stripeSessionId: { type: "string" },
          },
        },
        Review: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            productId: { type: "string" },
            rating: { type: "number", minimum: 1, maximum: 5 },
            title: { type: "string" },
            comment: { type: "string" },
          },
        },
      },
    },
    tags: [
      { name: "Users", description: "User authentication & profile management" },
      { name: "Products", description: "Product catalog & search" },
      { name: "Cart", description: "Shopping cart operations" },
      { name: "Orders", description: "Order management" },
      { name: "Payment", description: "Stripe payment processing" },
      { name: "Reviews", description: "Product reviews & ratings" },
      { name: "Wishlist", description: "User wishlist" },
      { name: "Admin", description: "Admin dashboard & management" },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
