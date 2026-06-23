/*
  Warnings:

  - Made the column `module` on table `OpeningDecisionSetting` required.
  - A unique constraint covering the columns `[module]` on the table `OpeningDecisionSetting` will be added.

*/

-- 先清理可能的重复数据（保留最新的一条）
DELETE FROM "OpeningDecisionSetting"
WHERE id NOT IN (
  SELECT DISTINCT ON (module) id
  FROM "OpeningDecisionSetting"
  WHERE module IS NOT NULL
  ORDER BY module, "updatedAt" DESC
);

-- 删除 module 为 null 的记录
DELETE FROM "OpeningDecisionSetting" WHERE module IS NULL;

-- AlterTable
ALTER TABLE "OpeningDecisionSetting" ALTER COLUMN "module" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OpeningDecisionSetting_module_key" ON "OpeningDecisionSetting"("module");
