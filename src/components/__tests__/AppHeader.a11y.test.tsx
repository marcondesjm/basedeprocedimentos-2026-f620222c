import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/AppHeader";

const renderHeader = (isAppUpToDate = true) =>
  render(
    <SidebarProvider>
      <AppHeader currentDateTime={new Date("2026-05-11T10:30:00")} isAppUpToDate={isAppUpToDate} />
    </SidebarProvider>,
  );

describe("AppHeader · a11y", () => {
  it("não tem violações de acessibilidade quando atualizado", async () => {
    const { container } = renderHeader(true);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("não tem violações de acessibilidade com botão Atualizar visível", async () => {
    const { container } = renderHeader(false);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("expõe banner role e título único como h1", () => {
    renderHeader();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(/Gestão de Procedimentos/i);
  });

  it("o botão do menu lateral tem aria-label descritivo e tamanho de toque adequado", () => {
    renderHeader();
    const trigger = screen.getByRole("button", { name: /menu lateral/i });
    expect(trigger).toHaveAttribute("aria-label");
    expect(trigger.className).toMatch(/h-10/);
    expect(trigger.className).toMatch(/w-10/);
    expect(trigger.className).toMatch(/focus-visible:ring/);
  });

  it("o botão Atualizar tem aria-label descritivo e foco visível", () => {
    renderHeader(false);
    const updateBtn = screen.getByRole("button", { name: /atualizar a aplica/i });
    expect(updateBtn).toHaveAttribute("aria-label");
    expect(updateBtn.className).toMatch(/focus-visible:ring/);
    expect(updateBtn.className).toMatch(/h-9/);
  });

  it("a data/hora é exposta via <time dateTime> com label legível", () => {
    const { container } = renderHeader();
    const time = container.querySelector("time");
    expect(time).not.toBeNull();
    expect(time).toHaveAttribute("datetime");
    expect(time).toHaveAttribute("aria-label");
  });
});