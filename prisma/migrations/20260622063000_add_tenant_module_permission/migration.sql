-- CreateTable
CREATE TABLE "TenantModulePermission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "storeOpeningConsultation" BOOLEAN NOT NULL DEFAULT true,
    "categorySelectionAdvice" BOOLEAN NOT NULL DEFAULT true,
    "locationScreening" BOOLEAN NOT NULL DEFAULT true,
    "brandPositioningAdvice" BOOLEAN NOT NULL DEFAULT true,
    "licenseAndLaunchChecklist" BOOLEAN NOT NULL DEFAULT true,
    "storeOpeningProcessSOP" BOOLEAN NOT NULL DEFAULT true,
    "priceSuggestion" BOOLEAN NOT NULL DEFAULT true,
    "groupPurchasePackageDesign" BOOLEAN NOT NULL DEFAULT true,
    "marketingAdvice" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantModulePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantModulePermission_tenantId_key" ON "TenantModulePermission"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantModulePermission" ADD CONSTRAINT "TenantModulePermission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
