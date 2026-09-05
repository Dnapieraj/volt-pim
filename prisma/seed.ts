import { PrismaClient, ProductStatus, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const catalog = [
  {
    sku: "YDY-3X2.5",
    ean: "5901234123457",
    manufacturerCode: "BIT-YDY-325",
    name: "Przewód YDY 3×2,5 mm²",
    brand: "Bitner",
    category: "Przewody",
    unit: "m",
    price: 4.8,
    vat: 23,
    stock: 420,
    minOrder: 50,
    packageQty: 100,
    warehouseLocation: "A-12-04",
    weightKg: 0.16,
    voltage: "450/750 V",
    current: "",
    ipRating: "",
    status: ProductStatus.ACTIVE,
    description: "Przewód instalacyjny do układania na tynku i pod tynkiem.",
    notes: "Popularna pozycja — trzymać min. 200 m.",
    attributes: [
      { key: "Przekrój", value: "3×2,5 mm²" },
      { key: "Izolacja", value: "PVC" },
      { key: "Kolor powłoki", value: "biały" },
    ],
    substitutes: ["YDY-3X1.5"],
  },
  {
    sku: "YDY-3X1.5",
    ean: "5901234123458",
    manufacturerCode: "BIT-YDY-315",
    name: "Przewód YDY 3×1,5 mm²",
    brand: "Bitner",
    category: "Przewody",
    unit: "m",
    price: 3.2,
    vat: 23,
    stock: 880,
    minOrder: 50,
    packageQty: 100,
    warehouseLocation: "A-12-03",
    weightKg: 0.11,
    voltage: "450/750 V",
    current: "",
    ipRating: "",
    status: ProductStatus.ACTIVE,
    description: "Lżejszy przekrój do obwodów oświetleniowych.",
    notes: "",
    attributes: [
      { key: "Przekrój", value: "3×1,5 mm²" },
      { key: "Izolacja", value: "PVC" },
    ],
    substitutes: ["YDY-3X2.5"],
  },
  {
    sku: "MCB-B16",
    ean: "3606480501234",
    manufacturerCode: "A9F03116",
    name: "Wyłącznik nadprądowy B16 1P",
    brand: "Schneider",
    category: "Aparatura",
    unit: "szt.",
    price: 28.9,
    vat: 23,
    stock: 64,
    minOrder: 1,
    packageQty: 12,
    warehouseLocation: "B-02-11",
    weightKg: 0.12,
    voltage: "230/400 V",
    current: "16 A",
    ipRating: "IP20",
    status: ProductStatus.ACTIVE,
    description: "Charakterystyka B, 6 kA. Do gniazd i obwodów gniazdowych.",
    notes: "Zamiennik Hager MCB-C16 przy braku stanu.",
    attributes: [
      { key: "Bieguny", value: "1P" },
      { key: "Charakterystyka", value: "B" },
      { key: "Icu", value: "6 kA" },
    ],
    substitutes: ["MCB-C16"],
  },
  {
    sku: "MCB-C16",
    ean: "3250614311234",
    manufacturerCode: "MBN116",
    name: "Wyłącznik nadprądowy C16 1P",
    brand: "Hager",
    category: "Aparatura",
    unit: "szt.",
    price: 31.5,
    vat: 23,
    stock: 12,
    minOrder: 1,
    packageQty: 12,
    warehouseLocation: "B-02-12",
    weightKg: 0.13,
    voltage: "230/400 V",
    current: "16 A",
    ipRating: "IP20",
    status: ProductStatus.ACTIVE,
    description: "Charakterystyka C — silniki, zasilacze, większy prąd rozruchu.",
    notes: "Stan niski.",
    attributes: [
      { key: "Bieguny", value: "1P" },
      { key: "Charakterystyka", value: "C" },
    ],
    substitutes: ["MCB-B16"],
  },
  {
    sku: "GN-230",
    ean: "3245060123456",
    manufacturerCode: "LEG-0778-21",
    name: "Gniazdo natynkowe 230V IP44",
    brand: "Legrand",
    category: "Osprzęt",
    unit: "szt.",
    price: 19.9,
    vat: 23,
    stock: 0,
    minOrder: 1,
    packageQty: 10,
    warehouseLocation: "C-01-08",
    weightKg: 0.18,
    voltage: "230 V",
    current: "16 A",
    ipRating: "IP44",
    status: ProductStatus.DRAFT,
    description: "Gniazdo z klapką, do pomieszczeń wilgotnych.",
    notes: "Czeka na zdjęcia i akceptację karty.",
    attributes: [
      { key: "Montaż", value: "natynk" },
      { key: "Uziemienie", value: "tak" },
    ],
    substitutes: [] as string[],
  },
  {
    sku: "LED-36W",
    ean: "8718696451234",
    manufacturerCode: "PH-LED-36-4K",
    name: "Oprawa LED 36W 4000K",
    brand: "Philips",
    category: "Oświetlenie",
    unit: "szt.",
    price: 89,
    vat: 23,
    stock: 27,
    minOrder: 1,
    packageQty: 4,
    warehouseLocation: "D-04-02",
    weightKg: 1.4,
    voltage: "230 V",
    current: "",
    ipRating: "IP65",
    status: ProductStatus.ARCHIVED,
    description:
      "Barwa 4000 K, 3600 lm. Wycofana z oferty — zostaje na wyczerpanie stanu.",
    notes: "Nie zamawiać ponownie.",
    attributes: [
      { key: "Moc", value: "36 W" },
      { key: "Strumień", value: "3600 lm" },
      { key: "Barwa", value: "4000 K" },
    ],
    substitutes: [] as string[],
  },
];

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.productSubstitute.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categoryNames = [
    "Przewody",
    "Aparatura",
    "Osprzęt",
    "Oświetlenie",
    "Rozdzielnice",
    "Narzędzia",
  ];

  const categories = await Promise.all(
    categoryNames.map((name) => prisma.category.create({ data: { name } })),
  );
  const categoryId = Object.fromEntries(
    categories.map((item) => [item.name, item.id]),
  );

  for (const item of catalog) {
    await prisma.product.create({
      data: {
        sku: item.sku,
        ean: item.ean,
        manufacturerCode: item.manufacturerCode,
        name: item.name,
        brand: item.brand,
        categoryId: categoryId[item.category],
        unit: item.unit,
        price: item.price,
        vat: item.vat,
        stock: item.stock,
        minOrder: item.minOrder,
        packageQty: item.packageQty,
        warehouseLocation: item.warehouseLocation,
        weightKg: item.weightKg,
        voltage: item.voltage,
        current: item.current,
        ipRating: item.ipRating,
        status: item.status,
        description: item.description,
        notes: item.notes,
        attributes: { create: item.attributes },
      },
    });
  }

  for (const item of catalog) {
    const product = await prisma.product.findUniqueOrThrow({
      where: { sku: item.sku },
    });
    for (const sku of item.substitutes) {
      const substitute = await prisma.product.findUniqueOrThrow({
        where: { sku },
      });
      await prisma.productSubstitute.create({
        data: { productId: product.id, substituteId: substitute.id },
      });
    }
  }

  const passwordHash = await hash("haslo123", 10);
  const demoUsers = [
    {
      email: "admin@voltpim.dev",
      name: "Daniel",
      role: UserRole.ADMIN,
    },
    {
      email: "edytor@voltpim.dev",
      name: "Anna",
      role: UserRole.EDITOR,
    },
    {
      email: "podglad@voltpim.dev",
      name: "Marek",
      role: UserRole.VIEWER,
    },
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, passwordHash },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
