import { describe, expect, it } from "vitest";
import {
  canDeleteProducts,
  canImportCatalog,
  canManageUsers,
  canWriteProducts,
  isAppRole,
  isCatalogWritePath,
} from "./permissions";

describe("roles", () => {
  it("gives editors write access but not user admin or delete", () => {
    expect(canWriteProducts("EDITOR")).toBe(true);
    expect(canImportCatalog("EDITOR")).toBe(true);
    expect(canDeleteProducts("EDITOR")).toBe(false);
    expect(canManageUsers("EDITOR")).toBe(false);
  });

  it("keeps viewers read-only", () => {
    expect(canWriteProducts("VIEWER")).toBe(false);
    expect(canImportCatalog("VIEWER")).toBe(false);
    expect(canDeleteProducts("VIEWER")).toBe(false);
    expect(canManageUsers("VIEWER")).toBe(false);
  });

  it("gives admins the full catalog and user panel", () => {
    expect(canWriteProducts("ADMIN")).toBe(true);
    expect(canDeleteProducts("ADMIN")).toBe(true);
    expect(canManageUsers("ADMIN")).toBe(true);
  });

  it("rejects unknown roles", () => {
    expect(isAppRole("SUPERUSER")).toBe(false);
    expect(isAppRole("EDITOR")).toBe(true);
  });
});

describe("write paths", () => {
  it("blocks viewers from create, edit, and import", () => {
    expect(isCatalogWritePath("/products/new")).toBe(true);
    expect(isCatalogWritePath("/products/abc/edit")).toBe(true);
    expect(isCatalogWritePath("/import")).toBe(true);
    expect(isCatalogWritePath("/products")).toBe(false);
    expect(isCatalogWritePath("/products/abc")).toBe(false);
    expect(isCatalogWritePath("/categories")).toBe(false);
    expect(isCatalogWritePath("/account")).toBe(false);
  });
});
